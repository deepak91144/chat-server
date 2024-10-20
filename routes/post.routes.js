import express from "express";
import {
  createPost,
  fetchPosts,
  fetchPostsByUSerId,
  postDetails,
} from "../controllers/post.js";
import { isAuthenticated } from "../middlewares/auth.js";
const app = express.Router();

app.post("/new", isAuthenticated, createPost);
app.get("/", isAuthenticated, fetchPosts);
app.get("/user/:userId", isAuthenticated, fetchPostsByUSerId);
app.get("/:postId", isAuthenticated, postDetails);

export default app;
