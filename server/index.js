import "dotenv/config";
import express from "express";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import connectDB from "./config/db.js";
import auth_routes from "./routes/auth_routes.js";
import { socketHandler } from "./socket/index.js";
import message_routes from "./routes/message_routes.js";
import { seedChannels } from "./utils/seed_channels.js";
import channel_routes from "./routes/channel_routes.js";
import dm_routes from "./routes/dm_routes.js";


const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", auth_routes);
app.use("/api/messages", message_routes);
app.use("/api/channels", channel_routes);
app.use("/api/dms", dm_routes);

// Create HTTP server for Socket.io
const server = http.createServer(app);

// Socket.io setup
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// Attach socket handler
socketHandler(io);

// Connect DB and start server
const PORT = process.env.PORT || 5000;
connectDB().then(async () => {
  console.log("🛰  Mission Control: Systems nominal.");

  await seedChannels();

  server.listen(PORT, () =>
    console.log(`🌍 Ground control online at http://localhost:${PORT}`)
  );
});
