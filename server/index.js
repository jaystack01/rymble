import "dotenv/config";
import express from "express";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import connectDB from "./config/db.js";
import auth_routes from "./routes/auth_routes.js";
import { socketHandler } from "./socket/index.js";
import message_routes from "./routes/message_routes.js";
import channel_routes from "./routes/channel_routes.js";
import workspace_routes from "./routes/workspace_routes.js";
import user_routes from "./routes/user_routes.js";
import invite_routes from "./routes/invite_routes.js";
import demo_routes from "./routes/demo_routes.js";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", auth_routes);
app.use("/api/messages", message_routes);
app.use("/api/channels", channel_routes);
app.use("/api/workspaces", workspace_routes);
app.use("/api/users", user_routes);
app.use("/api/invites", invite_routes);
app.use("/api/demo", demo_routes);

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

socketHandler(io);

// Connect DB and start server
const PORT = process.env.PORT || 5000;
connectDB().then(async () => {
  console.log("🛰  Mission Control: Systems nominal.");

  server.listen(PORT, () =>
    console.log(`🌍 Ground control online at http://localhost:${PORT}`)
  );
});
