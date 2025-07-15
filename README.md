# Real-Time Collaborative To-Do Board 

## Tech Stack
- Frontend: React (no UI frameworks)
- Backend: Node.js + Express + MongoDB
- Real-time: Socket.IO
- Auth: JWT
- Deployment: Vercel (frontend), Render (backend)

## Live App
🔗 [Click here to try the app](https://real-time-collaborative-to-do-board-eight.vercel.app/)

## Features
- Login/Register with JWT Auth
- Drag-and-drop Kanban columns
- Real-time sync across users via sockets
- Smart Assign: auto-assigns task to user with fewest active tasks
- Conflict Handling: detects task editing conflicts and prompts resolution
- Action Log: tracks who did what and when (live updating)

## 🛠 Local Setup
### Frontend
```bash
cd frontend
npm install
npm start

### Frontend
cd backend
npm install
# create a .env file
PORT=5000
MONGO_URI=mongodb+srv://<your-uri>
JWT_SECRET=your_secret
npm start
