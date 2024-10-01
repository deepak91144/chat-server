import mongoose, { Schema, models, model, Types } from "mongoose";

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
          required: true,
        },
        url: {
          type: String,
          required: true,
        },
      },
    ],
  },
  { timestamps: true }
);
export const User = mongoose.models.Message || model("Message", schema);
