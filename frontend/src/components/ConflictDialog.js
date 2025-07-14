// src/components/ConflictDialog.js
import React from "react";
import "./ConflictDialog.css"; // optional external css

export default function ConflictDialog({ original, latest, onResolve }) {
  const changed = (field) => original[field] !== latest[field];

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h3>Edit Conflict</h3>
        <p>
          Someone updated this task while you were editing. Choose what to do:
        </p>

        <table className="conflict-table">
          <thead>
            <tr>
              <th>Your version</th>
              <th>Latest version</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className={changed("title") ? "diff" : ""}>
                {original.title}
              </td>
              <td className={changed("title") ? "diff" : ""}>{latest.title}</td>
            </tr>
            <tr>
              <td
                className={changed("description") ? "diff" : ""}
                style={{ whiteSpace: "pre-wrap" }}
              >
                {original.description || <em>(no description)</em>}
              </td>
              <td
                className={changed("description") ? "diff" : ""}
                style={{ whiteSpace: "pre-wrap" }}
              >
                {latest.description || <em>(no description)</em>}
              </td>
            </tr>
          </tbody>
        </table>

        <div className="dialog-actions">
          <button onClick={() => onResolve("latest")}>Take Latest</button>
          <button onClick={() => onResolve("overwrite")}>Overwrite</button>
        </div>
      </div>
    </div>
  );
}
