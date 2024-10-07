import mongoose, { Schema, Types, model } from "mongoose";
import { hash } from "bcrypt";
const schema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    userName: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    avatar: {
      public_id: {
        type: String,
      },
      url: {
        type: String,
      },
    },
    friends: [
      {
        type: Types.ObjectId,
        ref: "User",
        default: [],
      },
    ],
  },
  { timestamps: true }
);
schema.pre("save", async function (next) {
  if (!this.isModified("password")) next();
  this.password = await hash(this.password, 10);
});
export const User = mongoose.models.User || model("User", schema);
