import {
  acceptFriendRequest,
  addNewUser,
  fileUpload,
  friendRequestISent,
  getAllUsers,
  getMyFriendRequests,
  getMyProfile,
  login,
  logout,
  myFriends,
  sendFriendRequest,
  updateUserDetails,
} from "../controllers/user.js";

import express from "express";
import { isAuthenticated } from "../middlewares/auth.js";
import { uploadImage } from "../middlewares/file-upload.js";
const app = express.Router();
app.post("/addNewUser", addNewUser);
app.post("/login", login);
app.put("/update", updateUserDetails);
app.get("/profile", isAuthenticated, getMyProfile);
app.get("/logout", logout);
app.post("/file-upload", uploadImage.single("photo"), fileUpload);
app.get("/all", isAuthenticated, getAllUsers);
app.post("/send-friend-request", isAuthenticated, sendFriendRequest);
app.post("/accept-friend-request", isAuthenticated, acceptFriendRequest);
app.get("/friend-request/:receiver", isAuthenticated, getMyFriendRequests);
app.get("/friend-request-iSent/:userId", isAuthenticated, friendRequestISent);
app.get("/my-friends/:userId", isAuthenticated, myFriends);

export default app;
