import React from "react";
import TaskCard from "./TaskCard";

export default function Column({
  title,
  status,
  tasks,
  onDrop,
  onRefresh,
  onConflict,
}) {
  return (
    <div
      className="column"
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => onDrop(e, status)}
    >
      <h3>{title}</h3>
      {tasks
        .filter((t) => t.status === status)
        .map((t) => (
          <TaskCard
            key={t._id}
            task={t}
            onRefresh={onRefresh}
            onConflict={onConflict}
          />
        ))}
    </div>
  );
}
