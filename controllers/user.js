import { compare } from "bcrypt";
import { User } from "../models/user.js";
import { cookieOptions, sendToken } from "../utils/features.js";
import { errorHandler } from "../utils/errorHandler.js";

export const addNewUser = async (req, res, next) => {
  const { name, userName, email, password, avatar } = req.body;
  const user = new User({
    name: name,
    userName: userName,
    email: email,
    password: password,
    avatar: avatar,
  });
  const newUser = await user.save();

  sendToken(res, user, 201, "user created");
};
export const login = async (req, res) => {
  const { userName, password } = req.body;

  const user = await User.findOne({ userName }).select("+password");
  console.log("password", user);
  if (!user) {
    return errorHandler("invalid credential", 404, req, res);
  }
  const isPasswordMatched = await compare(password, user.password);

  if (!isPasswordMatched) {
    return errorHandler("invalid password", 404, req, res);
  }
  sendToken(res, user, 201, "login successful");
};

export const getMyProfile = async (req, res) => {
  const userId = req.userId;
  const user = await User.findById(userId);
  return res.status(200).json({
    message: "user data fetched",
    user,
  });
};
export const logout = async (req, res) => {
  return res
    .status(200)
    .cookie("chatAppToken", "", { ...cookieOptions, maxAge: 0 })
    .json({
      success: true,
      message: "logout successfully",
    });
};
