import express from "express";
import {
  addMember,
  chatDetails,
  deleteGroup,
  gatMessages,
  getMyChats,
  getMyGroups,
  groupDetails,
  leaveGroup,
  newChat,
  newGroupChat,
  putLatestChatOnTop,
  removeMember,
  renameGroup,
  sendAttachment,
  sendMessage,
} from "../controllers/chat.js";
import { isAuthenticated } from "../middlewares/auth.js";
const app = express.Router();

app.post("/group/new", isAuthenticated, newGroupChat);
app.post("/new", isAuthenticated, newChat);
app.get("/:userId", isAuthenticated, getMyChats);
app.get("/my-groups/:userId", isAuthenticated, getMyGroups);
app.put("/add-members", isAuthenticated, addMember);
app.put("/remove-member", isAuthenticated, removeMember);
app.put("/leave-group/:chatId", isAuthenticated, leaveGroup);
app.post("/message/attachments", isAuthenticated, sendAttachment);
app.post("/message", isAuthenticated, sendMessage);
app.get("/:id", isAuthenticated, chatDetails);
app.get("/group/:id", isAuthenticated, groupDetails);
app.put("/rename-group", isAuthenticated, renameGroup);
app.delete("/group/delete/:chatId", isAuthenticated, deleteGroup);
app.get("/message/:chatId", isAuthenticated, gatMessages);
app.put("/re-arrange/:chatId", putLatestChatOnTop);
app.put("/testing", (req, res) => {
  return res.status(200).json({
    data: "working",
  });
});

export default app;
