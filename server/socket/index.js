import jwt from "jsonwebtoken";
import Message from "../models/Message.js";

// In-memory presence structures. For production use Redis or another
// centralized store to support multiple server instances.
const onlineUsers = new Map(); // userId -> Set(socketId)
const socketRooms = new Map(); // socketId -> Set(roomId)
const roomMembers = new Map(); // roomId -> Set(userId)

const addUserSocket = (userId, socketId) => {
  const set = onlineUsers.get(userId) || new Set();
  const wasOffline = set.size === 0;
  set.add(socketId);
  onlineUsers.set(userId, set);
  return wasOffline;
};

const removeUserSocket = (userId, socketId) => {
  const set = onlineUsers.get(userId);
  if (!set) return false;
  set.delete(socketId);
  if (set.size === 0) {
    onlineUsers.delete(userId);
    return true; // now offline
  }
  onlineUsers.set(userId, set);
  return false;
};

const addUserToRoom = (roomId, userId, socketId) => {
  // track socket -> rooms
  const sRooms = socketRooms.get(socketId) || new Set();
  sRooms.add(roomId);
  socketRooms.set(socketId, sRooms);

  // track room -> users
  const members = roomMembers.get(roomId) || new Set();
  const wasPresent = members.has(userId);
  members.add(userId);
  roomMembers.set(roomId, members);

  return { onlineCount: members.size, wasPresent };
};

const removeUserFromRoomIfNeeded = (roomId, userId, socketId) => {
  // remove mapping socket->room
  const sRooms = socketRooms.get(socketId);
  if (sRooms) {
    sRooms.delete(roomId);
    if (sRooms.size === 0) socketRooms.delete(socketId);
    else socketRooms.set(socketId, sRooms);
  }

  // Check if other sockets of this user are still in the room
  const userSockets = onlineUsers.get(userId) || new Set();
  let stillInRoom = false;
  for (const otherSockId of userSockets) {
    const otherRooms = socketRooms.get(otherSockId);
    if (otherRooms && otherRooms.has(roomId)) {
      stillInRoom = true;
      break;
    }
  }

  if (!stillInRoom) {
    const members = roomMembers.get(roomId);
    if (members) {
      members.delete(userId);
      if (members.size === 0) roomMembers.delete(roomId);
      else roomMembers.set(roomId, members);
      return { onlineCount: members.size };
    }
  }
  return null;
};

export const socketHandler = (io) => {
  // Authenticate every socket connection
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error("Authentication error"));

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      next();
    } catch (err) {
      next(new Error("Authentication error"));
    }
  });

  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.userId} (socket ${socket.id})`);

    // Add this socket to user's online set
    const becameOnline = addUserSocket(socket.userId, socket.id);

    // Send initial presence list to this socket
    socket.emit("presence:init", { online: Array.from(onlineUsers.keys()) });

    // If user was previously offline, broadcast they are online
    if (becameOnline) {
      io.emit("user:online", { userId: socket.userId });
    }

    // Join a given room
    socket.on("join_room", (roomId) => {
      socket.join(roomId);
      const { onlineCount, wasPresent } = addUserToRoom(roomId, socket.userId, socket.id);
      console.log(`${socket.userId} joined room ${roomId}`);

      // Emit updated presence for that room to its members
      io.to(roomId).emit("room:presence", { roomId, onlineCount });
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
      console.log(`User disconnected: ${socket.userId} (socket ${socket.id})`);

      // Remove socket -> rooms mapping and update room presence
      const sRooms = socketRooms.get(socket.id) || new Set();
      for (const roomId of sRooms) {
        const updated = removeUserFromRoomIfNeeded(roomId, socket.userId, socket.id);
        if (updated) {
          io.to(roomId).emit("room:presence", { roomId, onlineCount: updated.onlineCount });
        }
      }

      // Remove from online users and broadcast if fully offline
      const becameOffline = removeUserSocket(socket.userId, socket.id);
      if (becameOffline) {
        io.emit("user:offline", { userId: socket.userId });
      }
    });
  });
};
