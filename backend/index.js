require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

// make io accessible in routes
app.use((req, _, next) => {
  req.io = io;
  next();
});

app.use(cors());
app.use(express.json());

app.use("/api/auth", require("./routes/auth"));
app.use("/api/tasks", require("./routes/tasks"));
app.use("/api/actions", require("./routes/actions"));

require("./socket")(io);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() =>
    server.listen(process.env.PORT, () => console.log("⚡  backend up"))
  )
  .catch(console.error);
