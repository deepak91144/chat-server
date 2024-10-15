import { Message } from "../models/message.js";
import { errorHandler } from "../utils/errorHandler.js";

export const getMessagesByChatId = async (req, res) => {
  const { chatId } = req.params;

  const messages = await Message.find({ chat: chatId }).populate(
    "sender",
    "name "
  );
  if (messages) {
    return res.status(200).json({
      succues: true,
      message: "Messages fetched",
      messages,
    });
  }
  return errorHandler("Internal server error", 500, req, res);
};
