const router = require("express").Router();
const Task = require("../models/Task");
const Action = require("../models/Action");
const User = require("../models/User");
const auth = require("../middleware/auth");

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

  // Count active tasks per user
  const active = await Task.find({
    boardId: task.boardId,
    status: { $ne: "Done" },
    assignedUser: { $ne: null },
  });
  const counts = {};
  active.forEach((t) => {
    const uid = t.assignedUser.toString();
    counts[uid] = (counts[uid] || 0) + 1;
  });

  // Choose least‑busy user
  const userIds = [...new Set(active.map((t) => t.assignedUser.toString()))];
  task.assignedUser = userIds.length
    ? userIds.reduce(
        (best, uid) => (counts[uid] < counts[best] ? uid : best),
        userIds[0]
      )
    : req.user.id;

  task.lastEdited = Date.now();
  await task.save();

  await Action.create({
    boardId: task.boardId,
    user: req.user.id,
    type: "smart-assign",
    taskId: task._id,
    detail: { assignedTo: task.assignedUser },
  });

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
    type: "edit",
    taskId: task._id,
  });

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

  req.io.to(task.boardId).emit("taskUpdated", req.params.id); // 👈 notify deletion
  req.io.to(task.boardId).emit("tasksChanged");
  res.json({ msg: "deleted" });
});

module.exports = router;
