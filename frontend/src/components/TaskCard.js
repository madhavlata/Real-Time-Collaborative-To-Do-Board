import React, { useContext, useState, useEffect } from "react";
import { api } from "../api";
import { AuthContext } from "../contexts/AuthContext";
import { socket } from "../socket"; // ← import the shared socket instance
import { motion } from "framer-motion";

export default function TaskCard({ task, onRefresh, onConflict, userMap }) {
  const { user } = useContext(AuthContext);

  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [stale, setStale] = useState(false);

  /* ───────────── Listen for live updates while editing ───────────── */
  useEffect(() => {
    if (!editing) return;

    const handleTaskUpdated = (updatedId) => {
      if (updatedId === task._id) setStale(true);
    };

    socket.on("taskUpdated", handleTaskUpdated);
    return () => socket.off("taskUpdated", handleTaskUpdated);
  }, [editing, task._id]);

  /* ─────────────── Save / Edit ─────────────── */
  const save = async () => {
    try {
      await api.put(`/tasks/${task._id}`, {
        title,
        lastEdited: task.lastEdited,
      });
      setEditing(false);
      setStale(false);
      onRefresh();
    } catch (err) {
      if (err.response?.status === 409) {
        onConflict?.({
          mine: { ...task, title },
          latest: err.response.data.latest,
        });
        setEditing(false);
        setStale(false);
      } else {
        alert(err.response?.data?.msg || "Update failed");
      }
    }
  };

  /* ─────────────── Smart Assign ─────────────── */
  const smartAssign = async () => {
    try {
      await api.post(`/tasks/${task._id}/smart-assign`);
      onRefresh();
    } catch (err) {
      alert(err.response?.data?.msg || "Smart Assign failed");
    }
  };
  const handleDelete = async () => {
    if (!window.confirm("Delete this task?")) return;
    await api.delete(`/tasks/${task._id}`);
    onRefresh();
  };

  /* ─────────────── Render ─────────────── */
  return (
    <motion.div
      className="card"
      draggable
      onDragStart={(e) => e.dataTransfer.setData("id", task._id)}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
    >
      {editing ? (
        <>
          {stale && (
            <div className="stale-banner">
              ⚠ This task was updated elsewhere! Saving will overwrite.
            </div>
          )}
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && save()}
          />
          <button onClick={save}>✔</button>
        </>
      ) : (
        <>
          <h4>{task.title}</h4>
          <span
            className={
              "badge " + task.priority.toLowerCase() // low | medium | high
            }
          >
            {task.priority}
          </span>

          <small>
            {task.assignedUser
              ? task.assignedUser === user?.id
                ? "🧑‍💻 You"
                : `👤 ${userMap[task.assignedUser] || "User"}`
              : "Unassigned"}
          </small>
        </>
      )}

      <div className="card-actions">
        <button onClick={() => setEditing((v) => !v)}>✏</button>
        <button onClick={smartAssign}>🤖</button>
        <button onClick={handleDelete}>🗑</button>
      </div>
    </motion.div>
  );
}
