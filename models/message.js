import mongoose, { Schema, model, Types } from "mongoose";

const schema = new Schema(
  {
    content: String,
    sender: {
      type: Types.ObjectId,
      ref: "User",
      require: true,
    },
    chat: {
      type: Types.ObjectId,
      ref: "Chat",
      require: true,
    },
    attachments: [
      {
        public_id: {
          type: String,
        },
        url: {
          type: String,
        },
      },
    ],
  },
  { timestamps: true }
);
export const Message = mongoose.models.Message || model("Message", schema);
