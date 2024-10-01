import {
  addNewUser,
  getMyProfile,
  login,
  logout,
} from "../controllers/user.js";

import express from "express";
import { isAuthenticated } from "../middlewares/auth.js";
const app = express.Router();
app.post("/addNewUser", addNewUser);
app.post("/login", login);
app.get("/profile", isAuthenticated, getMyProfile);
app.get("/logout", logout);
export default app;
