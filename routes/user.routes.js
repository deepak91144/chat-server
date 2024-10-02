import {
  addNewUser,
  fileUpload,
  getAllUsers,
  getMyProfile,
  login,
  logout,
} from "../controllers/user.js";

import express from "express";
import { isAuthenticated } from "../middlewares/auth.js";
import { uploadImage } from "../middlewares/file-upload.js";
const app = express.Router();
app.post("/addNewUser", addNewUser);
app.post("/login", login);
app.get("/profile", isAuthenticated, getMyProfile);
app.get("/logout", logout);
app.post("/file-upload", uploadImage.single("photo"), fileUpload);
app.get("/all", isAuthenticated, getAllUsers);
export default app;
