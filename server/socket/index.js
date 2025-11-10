import jwt from "jsonwebtoken";
import Message from "../models/Message.js";

export const socketHandler = (io) => {
  // Authenticate every socket connection
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error("Authentication error"));

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      next();
    } catch {
      next(new Error("Authentication error"));
    }
  });

  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.userId}`);

    // Join a given room
    socket.on("join_room", (roomId) => {
      socket.join(roomId);
      console.log(`${socket.userId} joined room ${roomId}`);
    });

    /**
     * Send message handler
     * Payload example:
     * {
     *   roomId: "general" | "abc123_efg456",
     *   message: "Hello",
     *   isDm: true/false,
     *   recipientId: "efg456"
     * }
     */
    socket.on(
      "send_message",
      async ({ roomId, message, isDm, recipientId }) => {
        try {
          let finalRoomId = roomId;

          // If it's a DM, derive deterministic shared room id
          if (isDm && recipientId) {
            finalRoomId = [socket.userId, recipientId].sort().join("_");
          }

          // Store message
          const newMessage = await Message.create({
            sender: socket.userId,
            roomId: finalRoomId,
            text: message,
          });

          // Populate sender info for frontend
          const populatedMessage = await newMessage.populate(
            "sender",
            "username"
          );

          // Emit to everyone in that room
          io.to(finalRoomId).emit("receive_message", {
            _id: populatedMessage._id,
            roomId: populatedMessage.roomId,
            text: populatedMessage.text,
            sender: {
              _id: populatedMessage.sender._id,
              username: populatedMessage.sender.username,
            },
            timestamp: populatedMessage.createdAt,
          });
        } catch (err) {
          console.error("Error sending message:", err);
        }
      }
    );

    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.userId}`);
    });
  });
};
