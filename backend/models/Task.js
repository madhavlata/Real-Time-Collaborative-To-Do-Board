const { Schema, model, Types } = require("mongoose");

const taskSchema = new Schema({
  title: { type: String, required: true },
  description: String,
  status: {
    type: String,
    enum: ["Todo", "In Progress", "Done"],
    default: "Todo",
  },
  priority: {
    type: String,
    enum: ["Low", "Medium", "High"],
    default: "Medium",
  },
  assignedUser: { type: Types.ObjectId, ref: "User" },
  boardId: String,
  lastEdited: { type: Date, default: Date.now },
});

module.exports = model("Task", taskSchema);
// This code defines a Mongoose schema for a Task model in a MongoDB database.
// The Task model includes fields for title, description, status, priority, assigned user, board ID, and last edited timestamp.
// It uses the Mongoose library to create a schema and model, which can be used to interact with the tasks collection in the database.
// The status field can be one of 'Todo', 'In Progress', or 'Done',
