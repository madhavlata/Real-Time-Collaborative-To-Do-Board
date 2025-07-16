# Logic Document

## Smart Assign Logic

The "Smart Assign" feature assigns a task to the user who currently has the fewest active tasks.

### How It Works:
1. When the Smart Assign button is clicked, the backend fetches all tasks from the same board.
2. It counts the number of **active tasks** (i.e., tasks that are not "Done") per user.
3. The user with the **lowest count** is chosen and assigned the task.
4. If multiple users have the same count, the first one (based on query order) is picked.

### Example:
- User A: 3 active tasks
- User B: 1 active task
- User C: 2 active tasks

The task will be assigned to **User B**.

---

## Conflict Handling Logic

The app handles conflicts when **two users edit the same task simultaneously**.

### How It Works:
1. Every task has a `lastEdited` timestamp.
2. When a user submits an update, their client sends this timestamp to the server.
3. The server checks:
   - If the stored `lastEdited` time is **newer**, a **conflict is detected**.
4. The frontend then shows a **conflict dialog**:
   - It displays the user’s version vs. the latest version from the server.
   - The user can choose to:
     - **Overwrite** (force save their version)
     - **Cancel**
     - Or optionally **merge manually**

### Example Scenario:
- User A opens Task X at 10:00 AM
- User B edits and saves Task X at 10:01 AM
- User A edits and tries to save their version at 10:02 AM
→ A conflict is detected, and User A is prompted to resolve it.

---

## Validation Logic

1. **Unique Task Titles**:
   - On task creation, the server checks if another task with the **same title** exists on the same board.
   - If yes, it rejects the request with a validation error.

2. **Forbidden Titles**:
   - Task titles cannot be one of the board column names:
     - `"Todo"`, `"In Progress"`, `"Done"`

---

**All logic has been implemented on both backend (Node.js + MongoDB) and frontend (React) with real-time support using Socket.IO.**
