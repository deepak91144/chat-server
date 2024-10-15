import express from "express";
import { getMessagesByChatId } from "../controllers/message.js";
const app = express.Router();
app.get("/:chatId", getMessagesByChatId);
export default app;
