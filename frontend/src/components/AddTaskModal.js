import React, { useState } from "react";
import { api } from "../api";

export default function AddTaskModal({ boardId, onClose, onCreated }) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    priority: "Low",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/tasks", {
        ...form,
        boardId,
        status: "Todo",
      });
      onCreated(); // refresh tasks
      onClose();
    } catch (err) {
      alert(err.response?.data?.msg || "Could not create task");
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h3>Create Task</h3>
        <form onSubmit={handleSubmit}>
          <input
            required
            placeholder="Title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
          <textarea
            placeholder="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <select
            value={form.priority}
            onChange={(e) => setForm({ ...form, priority: e.target.value })}
          >
            <option>Low</option>
            <option>Medium</option>
            <option>High</option>
          </select>
          <button type="submit">Add</button>
          <button
            type="button"
            onClick={onClose}
            style={{ marginLeft: "10px" }}
          >
            Cancel
          </button>
        </form>
      </div>
    </div>
  );
}
