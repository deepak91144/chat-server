import mongoose, { Schema, model, Types } from "mongoose";

const postSchema = new Schema(
  {
    title: String,
    description: String,
    creator: {
      type: Types.ObjectId,
      ref: "User",
      require: true,
    },
    comments: [
      {
        type: Types.ObjectId,
        ref: "Comment",
      },
    ],
    images: [
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
export const Post = mongoose.models.Post || model("Post", postSchema);
