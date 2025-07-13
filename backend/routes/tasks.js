const router = require("express").Router();
const Task = require("../models/Task");
const Action = require("../models/Action");
const auth = require("../middleware/auth");
const User = require("../models/User");

// list by board
router.get("/:boardId", auth, async (req, res) => {
  res.json(await Task.find({ boardId: req.params.boardId }));
});

// create
router.post("/", auth, async (req, res) => {
  const task = await Task.create(req.body);
  await Action.create({
    boardId: task.boardId,
    user: req.user.id,
    type: "add",
    taskId: task._id,
  });
  req.io.to(task.boardId).emit("tasksChanged");
  res.status(201).json(task);
});

// Smart Assign endpoint
router.post("/:id/smart-assign", auth, async (req, res) => {
  const task = await Task.findById(req.params.id);
  if (!task) return res.status(404).json({ msg: "Task not found" });

  // Get all active tasks (not 'Done') in this board
  const activeTasks = await Task.find({
    boardId: task.boardId,
    status: { $ne: "Done" },
    assignedUser: { $ne: null },
  });

  // Count tasks per user
  const counts = {};
  for (const t of activeTasks) {
    const uid = t.assignedUser.toString();
    counts[uid] = (counts[uid] || 0) + 1;
  }

  // Find all users in this board (based on who has tasks)
  const userIds = [
    ...new Set(activeTasks.map((t) => t.assignedUser.toString())),
  ];

  // If no users yet assigned, default to the current user
  if (userIds.length === 0) {
    task.assignedUser = req.user.id;
  } else {
    // Find user with fewest tasks
    let bestUser = userIds[0];
    for (const uid of userIds) {
      if ((counts[uid] || 0) < (counts[bestUser] || 0)) {
        bestUser = uid;
      }
    }
    task.assignedUser = bestUser;
  }

  task.lastEdited = Date.now();
  await task.save();

  // Log the action
  await Action.create({
    boardId: task.boardId,
    user: req.user.id,
    type: "smart-assign",
    taskId: task._id,
    detail: { assignedTo: task.assignedUser },
  });

  req.io.to(task.boardId).emit("tasksChanged");
  res.json(task);
});

// update
router.put("/:id", auth, async (req, res) => {
  const clientEditedAt = req.body.lastEdited;

  const task = await Task.findById(req.params.id);
  if (!task) return res.status(404).json({ msg: "Task not found" });

  // Compare timestamps
  if (
    clientEditedAt &&
    new Date(clientEditedAt).getTime() < task.lastEdited.getTime()
  ) {
    return res.status(409).json({
      msg: "Edit conflict. Task has been updated by someone else.",
      latest: task,
    });
  }

  Object.assign(task, req.body, { lastEdited: Date.now() });
  await task.save();

  await Action.create({
    boardId: task.boardId,
    user: req.user.id,
    type: "edit",
    taskId: task._id,
  });

  req.io.to(task.boardId).emit("tasksChanged");
  res.json(task);
});

// delete
router.delete("/:id", auth, async (req, res) => {
  const task = await Task.findByIdAndDelete(req.params.id);
  await Action.create({
    boardId: task.boardId,
    user: req.user.id,
    type: "delete",
    taskId: req.params.id,
  });
  req.io.to(task.boardId).emit("tasksChanged");
  res.json({ msg: "deleted" });
});

module.exports = router;
// backend/routes/tasks.js
// This file handles task-related routes such as listing, creating, updating, and deleting tasks.
