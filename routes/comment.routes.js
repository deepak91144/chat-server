import express from "express";
import { addComment, fetchComments } from "../controllers/comment.js";
const app = express.Router();
app.post("/new", addComment);
app.get("/:postId", fetchComments);
export default app;
