const router = require("express").Router();
const Task = require("../models/Task");
const Action = require("../models/Action");
const auth = require("../middleware/auth");

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

// update
router.put("/:id", auth, async (req, res) => {
  const task = await Task.findByIdAndUpdate(
    req.params.id,
    { ...req.body, lastEdited: Date.now() },
    { new: true }
  );
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
