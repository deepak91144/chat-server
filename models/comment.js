import mongoose, { Schema, model, Types } from "mongoose";

const commentSchema = new Schema(
  {
    comment: String,

    user: {
      type: Types.ObjectId,
      ref: "User",
      require: true,
    },
    post: {
      type: Types.ObjectId,
      ref: "Post",
      require: true,
    },
  },
  { timestamps: true }
);
export const Comment =
  mongoose.models.Comment || model("Comment", commentSchema);
