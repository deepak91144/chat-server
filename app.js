import express from "express";
const app = express();
import { createServer } from "http";
import { Server } from "socket.io";
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});
import cors from "cors";
import cookieParser from "cookie-parser";
app.use(cors());
import "dotenv/config";
app.use(express.json());
app.use(cookieParser());
import userRoutes from "./routes/user.routes.js";
import chatrRoutes from "./routes/chat.routes.js";
import messageRoutes from "./routes/message.routes.js";
import postRoutes from "./routes/post.routes.js";
import commentRoutes from "./routes/comment.routes.js";
import { connectToDb } from "./config/dbConfig.js";
import { NEW_MESSAGE, NEW_MESSAGE_ALERT } from "./constants/events.js";
import { getSockets } from "./libs/helpers.js";
import { Message } from "./models/message.js";
connectToDb();
app.use("/user", userRoutes);
app.use("/api/v1/chat", chatrRoutes);
app.use("/api/v1/message", messageRoutes);
app.use("/api/v1/post", postRoutes);
app.use("/api/v1/comment", commentRoutes);
const userSocketIds = new Map();
io.on("connection", (socket) => {
  const user = {
    _id: "dewferf",
    name: "fefgerg",
  };
  // userSocketIds.set(user._id.toString(), socket.id);

  socket.on("disconnect", () => {
    userSocketIds.delete(user._id.toString());
    console.log("user disConnected");
  });
  socket.on("chat", (payload) => {
    io.emit("chat", payload);
  });

  socket.on("joinRoom", (payload) => {
    socket.join(payload.roomId.toString());
    console.log(`${payload.user.name} has joined the room ${payload.roomId}`);
    socket.to(payload.roomId.toString()).emit("userJoined", {
      chatId: payload.roomId,
      user: payload.user,
    });
  });

  socket.on("newPost", (payload) => {
    console.log("newPost", payload);

    io.emit("newPostAlert", payload);
  });

  socket.on("sendMessage", async (payload) => {
    console.log(payload);
    const messageForRealTime = {
      _id: Math.random(),
      content: payload.content,
      sender: {
        _id: payload.sender._id,
        name: payload.sender.name,
      },
      chat: payload.roomId,
      attachments: payload?.file
        ? [
            {
              public_id: payload?.file?.publicId,
              url: payload?.file?.url,
            },
          ]
        : [],
    };
    const messageForDb = {
      content: payload.content,
      sender: payload.sender._id,
      chat: payload.roomId,
      attachments: payload?.file
        ? {
            public_id: payload?.file?.publicId,
            url: payload?.file?.url,
          }
        : [],
    };
    io.to(payload.roomId.toString()).emit("rcvMsg", {
      chatId: payload.roomId,
      message: messageForRealTime,
    });
    console.log("dewr");

    io.sockets.emit(NEW_MESSAGE_ALERT, {
      chatId: payload.roomId,
      count: 1,
      sender: payload.sender._id,
    });
    try {
      await Message.create(messageForDb);
    } catch (error) {
      console.log(error);
    }
  });

  socket.on(NEW_MESSAGE, async (payload) => {
    payload.members.forEach((member) => {
      userSocketIds.set(member.toString(), socket.id);
    });

    const messageForRealTime = {
      _id: Math.random(),
      content: payload.content,
      sender: {
        _id: payload.sender._id,
        name: payload.sender.name,
      },
      chat: payload.chatId,
      createdAt: new Date(),
    };
    const messageForDb = {
      content: payload.content,
      sender: payload.sender._id,
      chat: payload.chatId,
    };
    const membersSocket = getSockets(payload.members);
    console.log("membersSocket", membersSocket);

    io.to(membersSocket).emit(NEW_MESSAGE, {
      chatId: payload.chatId,
      message: messageForRealTime,
    });
    io.to(membersSocket).emit(NEW_MESSAGE_ALERT, {
      chatId: payload.chatId,
    });
    try {
      await Message.create(messageForDb);
    } catch (error) {
      console.log(error);
    }
  });
});

server.listen(8000, () => {
  console.log("server is running on port 8000");
});
// app.listen(8000, () => {
//   console.log("server is running on port 3000");
// });
export { userSocketIds };
