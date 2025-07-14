const router = require("express").Router();
const Task = require("../models/Task");
const Action = require("../models/Action");
const User = require("../models/User");
const auth = require("../middleware/auth");
const broadcastAction = (io, boardId) => {
  io.to(boardId).emit("actionLogged");
};
/* ──────────────────────────────────────────────
   1.  LIST TASKS BY BOARD
───────────────────────────────────────────────*/
router.get("/:boardId", auth, async (req, res) => {
  res.json(await Task.find({ boardId: req.params.boardId }));
});

/* ──────────────────────────────────────────────
   2.  CREATE TASK
───────────────────────────────────────────────*/
router.post("/", auth, async (req, res) => {
  try {
    const { title, description, priority = "Medium", boardId } = req.body;

    // Validation
    const forbidden = ["Todo", "In Progress", "Done"];
    if (forbidden.includes(title.trim()))
      return res.status(400).json({ msg: "Title cannot be a column name" });

    if (await Task.findOne({ boardId, title: title.trim() }))
      return res
        .status(400)
        .json({ msg: "Task title must be unique per board" });

    // Create
    const task = await Task.create({
      title: title.trim(),
      description,
      priority,
      boardId,
      status: "Todo",
      lastEdited: Date.now(),
    });

    // Log + emit
    await Action.create({
      boardId,
      user: req.user.id,
      type: "add",
      taskId: task._id,
    });
    broadcastAction(req.io, boardId);

    req.io.to(boardId).emit("taskUpdated", task._id); // 👈 emit single‑task update
    req.io.to(boardId).emit("tasksChanged");

    res.status(201).json(task);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

/* ──────────────────────────────────────────────
   3.  SMART ASSIGN
───────────────────────────────────────────────*/
router.post("/:id/smart-assign", auth, async (req, res) => {
  const task = await Task.findById(req.params.id);
  if (!task) return res.status(404).json({ msg: "Task not found" });

  // 1) Build counts of active tasks per user (Todo / In‑Progress)
  const activeTasks = await Task.find({
    boardId: task.boardId,
    status: { $ne: "Done" },
    assignedUser: { $ne: null },
  });
  const counts = {};
  activeTasks.forEach((t) => {
    const uid = t.assignedUser.toString();
    counts[uid] = (counts[uid] || 0) + 1;
  });

  // 2) Fetch **all users** (or board members if you have separate list)
  const allUsers = await User.find().select("_id username");
  if (allUsers.length === 0)
    return res.status(500).json({ msg: "No users available for assignment" });

  // 3) Pick user with the fewest tasks (ties resolved by first in list)
  let bestUser = allUsers[0]._id.toString();
  allUsers.forEach((u) => {
    const uid = u._id.toString();
    if ((counts[uid] || 0) < (counts[bestUser] || 0)) {
      bestUser = uid;
    }
  });

  task.assignedUser = bestUser;
  task.lastEdited = Date.now();
  await task.save();

  await Action.create({
    boardId: task.boardId,
    user: req.user.id,
    type: "smart-assign",
    taskId: task._id,
    detail: { assignedTo: task.assignedUser },
  });
  broadcastAction(req.io, task.boardId);

  req.io.to(task.boardId).emit("taskUpdated", task._id); // 👈
  req.io.to(task.boardId).emit("tasksChanged");
  res.json(task);
});

/* ──────────────────────────────────────────────
   4.  UPDATE TASK (optimistic‑concurrency)
───────────────────────────────────────────────*/
router.put("/:id", auth, async (req, res) => {
  const clientEditedAt = req.body.lastEdited;
  const task = await Task.findById(req.params.id);
  if (!task) return res.status(404).json({ msg: "Task not found" });

  // Conflict check
  if (clientEditedAt && new Date(clientEditedAt) < task.lastEdited)
    return res.status(409).json({
      msg: "Edit conflict. Task has been updated by someone else.",
      latest: task,
    });

  Object.assign(task, req.body, { lastEdited: Date.now() });
  await task.save();

  await Action.create({
    boardId: task.boardId,
    user: req.user.id,
    type: req.body.move ? "drag-drop" : "edit", // NEW
    taskId: task._id,
    detail: req.body.move ? { newStatus: task.status } : undefined,
  });
  broadcastAction(req.io, task.boardId);

  req.io.to(task.boardId).emit("taskUpdated", task._id); // 👈
  req.io.to(task.boardId).emit("tasksChanged");
  res.json(task);
});

/* ──────────────────────────────────────────────
   5.  DELETE TASK
───────────────────────────────────────────────*/
router.delete("/:id", auth, async (req, res) => {
  const task = await Task.findByIdAndDelete(req.params.id);
  if (!task) return res.status(404).json({ msg: "Task not found" });

  await Action.create({
    boardId: task.boardId,
    user: req.user.id,
    type: "delete",
    taskId: task._id,
  });
  broadcastAction(req.io, task.boardId);

  req.io.to(task.boardId).emit("taskUpdated", req.params.id); // 👈 notify deletion
  req.io.to(task.boardId).emit("tasksChanged");
  res.json({ msg: "deleted" });
});

module.exports = router;
