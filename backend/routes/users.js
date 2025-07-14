// routes/users.js
const router = require("express").Router();
const User = require("../models/User");
const Task = require("../models/Task");
const auth = require("../middleware/auth");

// Return list of users that have tasks in this board
router.get("/:boardId", auth, async (req, res) => {
  const ids = await Task.distinct("assignedUser", {
    boardId: req.params.boardId,
    assignedUser: { $ne: null },
  });
  const users = await User.find({ _id: { $in: ids } }).select(
    "_id username email"
  );
  res.json(users);
});

module.exports = router;
