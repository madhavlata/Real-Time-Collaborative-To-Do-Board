import React, { useContext, useEffect, useState } from "react";
import { api } from "../api";
import Column from "../components/Column";
import { socket } from "../socket";
import { AuthContext } from "../contexts/AuthContext";
import AddTaskModal from "../components/AddTaskModal";
import ConflictDialog from "../components/ConflictDialog";

const BOARD_ID = "BOARD123";

export default function Board() {
  const [tasks, setTasks] = useState([]);
  const [actions, setActions] = useState([]);
  const [userMap, setUserMap] = useState({}); //  ➜ { userId: username }
  const [showModal, setShowModal] = useState(false);
  const [conflict, setConflict] = useState(null);
  const { logout } = useContext(AuthContext);

  /* ───────────── Fetch helpers ───────────── */
  const fetchUsers = () =>
    api.get(`/users/${BOARD_ID}`).then((r) => {
      const map = {};
      r.data.forEach((u) => (map[u._id] = u.username));
      setUserMap(map);
    });

  const fetchTasks = () =>
    api.get(`/tasks/${BOARD_ID}`).then((r) => {
      setTasks(r.data);
      fetchUsers(); // refresh user list whenever tasks refresh
    });

  const fetchActions = () =>
    api.get(`/actions/${BOARD_ID}`).then((r) => setActions(r.data));

  /* ───────────── Socket lifecycle ───────────── */
  useEffect(() => {
    fetchTasks();
    fetchActions();
    socket.emit("joinBoard", BOARD_ID);
    socket.on("tasksChanged", fetchTasks);
    socket.on("actionLogged", fetchActions);
    return () => {
      socket.emit("leaveBoard", BOARD_ID);
      socket.off("tasksChanged", fetchTasks);
      socket.off("actionLogged", fetchActions);
    };
  }, []);

  /* ───────────── Drag‑drop handler ───────────── */
  const handleDrop = async (e, newStatus) => {
    const id = e.dataTransfer.getData("id");
    const task = tasks.find((t) => t._id === id);
    if (!task || task.status === newStatus) return;
    try {
      await api.put(`/tasks/${id}`, {
        status: newStatus,
        lastEdited: task.lastEdited,
        move: true,
      });
    } catch (err) {
      if (err.response?.status === 409) {
        alert("Conflict! Someone else updated this task.");
      }
    }
  };

  /* ───────────── JSX ───────────── */
  return (
    <div className="board-wrapper">
      <nav>
        <h2>Collaborative To‑Do (Board 123)</h2>
        <div>
          <button onClick={() => setShowModal(true)}>+ Add Task</button>
          <button onClick={logout} style={{ marginLeft: "1rem" }}>
            Logout
          </button>
        </div>
      </nav>

      <div className="board">
        {["Todo", "In Progress", "Done"].map((status) => (
          <Column
            key={status}
            title={status}
            status={status}
            tasks={tasks}
            userMap={userMap} /* ➜ pass map to show assignee */
            onDrop={handleDrop}
            onRefresh={fetchTasks}
            onConflict={setConflict}
          />
        ))}
      </div>

      {showModal && (
        <AddTaskModal
          boardId={BOARD_ID}
          onClose={() => setShowModal(false)}
          onCreated={fetchTasks}
        />
      )}

      {conflict && (
        <ConflictDialog
          original={conflict.mine}
          latest={conflict.latest}
          onResolve={async (choice) => {
            if (choice === "overwrite") {
              await api.put(`/tasks/${conflict.mine._id}`, {
                ...conflict.mine,
                lastEdited: conflict.latest.lastEdited,
              });
            }
            setConflict(null);
            fetchTasks();
          }}
        />
      )}

      <aside className="log">
        <h4>Activity Log</h4>
        {actions.map((a) => (
          <div key={a._id}>
            <small>
              {new Date(a.createdAt).toLocaleTimeString()} • {a.type} by{" "}
              {a.user?.username}
            </small>
          </div>
        ))}
      </aside>
    </div>
  );
}
