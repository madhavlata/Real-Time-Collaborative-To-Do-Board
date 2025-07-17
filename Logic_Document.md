# Logic Document

## Smart Assign Logic

The "Smart Assign" feature assigns a task to the user who currently has the fewest active tasks.

### How It Works:
1. When the Smart Assign button is clicked, the backend fetches all tasks from the same board.
2. It counts the number of **active tasks** (i.e., tasks that are not marked as "Done") per user.
3. The user with the **lowest count** is chosen and assigned the task.
4. If multiple users have the same count, the first one (based on query order) is picked.

### Example:
- User A: 3 active tasks  
- User B: 1 active task  
- User C: 2 active tasks  

✅ The task will be assigned to **User B**.

---

## Conflict Handling Logic

The app handles conflicts when **two users edit the same task simultaneously** to ensure no updates are lost.

### How It Works:
1. Each task includes a `lastEdited` timestamp.
2. When a user edits and attempts to save a task, the frontend sends the task's local `lastEdited` value to the server.
3. The backend compares this timestamp with the current version in the database:
   - If the database has a **newer timestamp**, it means another user has already made changes → a **conflict is detected**.
4. The frontend opens a **conflict resolution modal**:
   - It shows the current server version vs. the user’s version.
   - The user is prompted to:
     - **Overwrite**: Save their version anyway.
     - **Cancel**: Abort the update.
     - (Optionally) **Copy Changes** to manually merge and retry.

### Example:
- User A opens Task T at 10:00 AM
- User B edits and saves Task T at 10:01 AM
- User A tries to save their edit at 10:02 AM  
➡️ A conflict is detected, and User A is shown the conflict resolution dialog.

---

## Validation Logic

### 1. Unique Task Titles
- While creating a task, the backend checks if another task with the same title already exists on the same board.
- If found, the request is rejected with a validation error.

### 2. Forbidden Titles
- Task titles **cannot** be the same as board column names:
  - `"Todo"`, `"In Progress"`, `"Done"`
- Such titles are blocked to avoid confusion in UI rendering.

---

## Real-Time Features

All above logic is supported in **real-time** using **Socket.IO**:

- New tasks, updates, assignments, and activity logs are broadcasted to all connected clients in a board room.
- If a user edits or changes a task, others see updates instantly.
- Conflict checks are done using timestamps to avoid silent overwrites.

---

### Tech Stack
- **Frontend**: React, Socket.IO Client
- **Backend**: Node.js, Express, MongoDB, Socket.IO Server
