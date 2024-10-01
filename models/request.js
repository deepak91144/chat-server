import mongoose, { Schema, model } from "mongoose";

const schema = new Schema(
  {
    status: {
      type: String,
      default: "pending",
      enum: ["pending", "accepted", "rejected"],
    },
    sender: {
      type: Types.ObjectId,
      ref: "User",
      require: true,
    },
    receiver: {
      type: Types.ObjectId,
      ref: "User",
      require: true,
    },
  },
  { timestamps: true }
);
export const User = mongoose.models.Request || model("Request", schema);
