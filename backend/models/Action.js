const { Schema, model, Types } = require("mongoose");

module.exports = model(
  "Action",
  new Schema({
    boardId: String,
    user: { type: Types.ObjectId, ref: "User" },
    type: String, // add | edit | delete | move | assign …
    taskId: { type: Types.ObjectId, ref: "Task" },
    detail: Schema.Types.Mixed,
    createdAt: { type: Date, default: Date.now },
  })
);
// This model represents actions taken by users on tasks within a board.
// It includes the board ID, user ID, action type, task ID, details of the action, and the timestamp of when the action was created.
// The action type can be one of several predefined values such as add, edit, delete, move, or assign.
