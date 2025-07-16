# Real-Time Collaborative To‑Do Board

A minimal Trello-like Kanban board that supports **multiple users collaborating in real time**. Built using React, Node.js, MongoDB, and Socket.IO—featuring drag-and-drop tasks, live sync, smart auto-assign, and conflict resolution.

## Tech Stack

- **Frontend**: React 
- **Backend**: Node.js + Express
- **Database**: MongoDB Atlas
- **Auth**: JWT (JSON Web Tokens)
- **Real-time**: Socket.IO
- **Deployment**: 
  - Frontend on Vercel
  - Backend on Render

## Live Demo

🔗 **Frontend**: https://real-time-collaborative-to-do-board-eight.vercel.app/
🔗 **Backend**: https://real-time-collaborative-to-do-board-qzkn.onrender.com
📽️ **Demo Video**: Will share soon
📄 **Logic Document**: [Logic_Document.md](./Logic_Document.md)

## Features

-  Register & Login with JWT
-  Kanban board: Todo, In Progress, Done
-  Drag-and-drop tasks between columns
-  Task filtering by priority + search
-  Real-time sync using WebSockets (Socket.IO)
-  Smart Assign: auto-assign task to user with fewest active tasks
-  Conflict Detection & Resolution (with prompt)
-  Live-updating activity log panel
-  Fully responsive (mobile + desktop)
-  Custom styling with smooth animations

## Folder Structure

```
project-root/
│
├── backend/         → Express API (auth, tasks, users, logs, socket events)
│   ├── routes/
│   ├── models/
│   ├── socket.js
│   └── .env
│
├── frontend/        → React frontend (Kanban UI, modals, sidebar, etc.)
│   ├── components/
│   ├── contexts/
│   ├── pages/
│   └── public/
│
├── README.md
└── Logic_Document.md
```

## Local Setup & Installation

> Prerequisite: Node.js, MongoDB Atlas account

### 1. Clone the Repo

```bash
git clone https://github.com/your-username/real-time-todo-board.git
cd real-time-todo-board
```

### 2. Setup Backend

```bash
cd backend
npm install
```
Create `.eve` file

Fill `.env` file with:

```env
PORT=5000
MONGO_URI=mongodb+srv://<your-user>:<your-pass>@cluster0.mongodb.net/
JWT_SECRET=your_secret_key
```

Start the backend server:

```bash
npm start
```

### 3. Setup Frontend

```bash
cd ../frontend
npm install
```

Set the API base URL inside your `api.js`:

```js
export const api = axios.create({
  baseURL: "https://your-backend-url.onrender.com/api",
});
```

Start the frontend:

```bash
npm start
```

## Smart Assign Logic

When a user clicks **Smart Assign** on a task:

1. The system fetches all users on the board.
2. Counts how many **active tasks** (Todo / In Progress) each user has.
3. Assigns the task to the user with the **fewest active tasks**.
4. If there’s a tie, the first user found is picked.

## Conflict Resolution Logic

To handle two users editing the **same task at the same time**:

1. Each task has a `lastEdited` timestamp.
2. When a user submits an edit, backend compares timestamps.
3. If they differ, a `409 Conflict` is returned.
4. Frontend shows a **dialog with both versions** (theirs and the latest).
5. User can choose to:
   - **Overwrite** with their version
   - **Merge** manually and resubmit
