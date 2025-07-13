const router = require("express").Router();
const Action = require("../models/Action");
const auth = require("../middleware/auth");

router.get("/:boardId", auth, async (req, res) => {
  const list = await Action.find({ boardId: req.params.boardId })
    .sort({ createdAt: -1 })
    .limit(20)
    .populate("user", "username");
  res.json(list);
});
module.exports = router;
