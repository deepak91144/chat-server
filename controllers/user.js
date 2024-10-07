import { compare } from "bcrypt";
import { User } from "../models/user.js";
import { Request } from "../models/request.js";
import { cookieOptions, emitEvent, sendToken } from "../utils/features.js";
import { errorHandler } from "../utils/errorHandler.js";
import { NEW_REQUEST, REFETCH_CHATS } from "../constants/events.js";
import { Chat } from "../models/chat.js";

export const addNewUser = async (req, res, next) => {
  try {
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
  } catch (error) {
    return errorHandler(error, 404, req, res);
  }
};
export const login = async (req, res) => {
  const { userName, password } = req.body;

  const user = await User.findOne({ userName }).select("+password");

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
export const fileUpload = (req, res) => {
  try {
    if (req.file) {
      res.status(201).json({
        success: true,
        messsage: "file uploaded successfully",
        file: req.file,
      });
    } else {
      return errorHandler("something went wrong", 404, req, res);
    }
  } catch (error) {
    return errorHandler("something went wrong", 404, req, res);
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ _id: { $nin: [req.userId] } });
    return res.status(201).json({
      message: "users fethed",
      success: true,
      users,
    });
  } catch (error) {
    return errorHandler("", 404, req, res);
  }
};
export const sendFriendRequest = async (req, res) => {
  const { receiver, senderId } = req.body;
  const friendRequestExist = await Request.findOne({
    $or: [
      { sender: senderId, receiver: receiver },
      { sender: receiver, receiver: senderId },
    ],
  });
  if (friendRequestExist) {
    return errorHandler("Request already sent", 404, req, res);
  }
  const friendRequest = await Request.create({ sender: senderId, receiver });
  emitEvent(req, NEW_REQUEST, [receiver]);
  return res.status(201).json({
    success: true,
    message: "friend request sent successfully",
  });
};

export const acceptFriendRequest = async (req, res) => {
  const { requestId, accept, userId } = req.body;
  const requestExist = await Request.findById(requestId);
  if (!requestExist) {
    return errorHandler("Friend request could not found", 404, req, res);
  }

  if (requestExist.receiver.toString() !== userId.toString()) {
    return errorHandler("Your are not authorized to accept", 401, req, res);
  }
  await Request.findOneAndDelete({ _id: requestId });
  if (!accept) {
    return res.status(201).json({
      success: true,
      message: "friend request rejected",
    });
  }

  const allMembers = [requestExist.receiver, requestExist.sender];
  await Chat.create({
    groupChat: false,
    creator: userId,
    members: allMembers,
  });
  await User.findOneAndUpdate(
    { _id: userId },
    { $push: { friends: requestExist.sender } },
    { new: true }
  );
  await User.findOneAndUpdate(
    { _id: requestExist.sender },
    { $push: { friends: userId } },
    { new: true }
  );

  emitEvent(req, REFETCH_CHATS, [
    requestExist.sender._id,
    requestExist.receiver._id,
  ]);
  return res.status(201).json({
    success: true,
    message: "friend request accepted",
  });
};

export const getMyFriendRequests = async (req, res) => {
  const { receiver } = req.params;

  const friendRequests = await Request.find({
    $and: [
      {
        $or: [{ sender: receiver }, { receiver }],
      },
      { status: "pending" },
    ],
  }).populate("sender", "name avatar");
  console.log("friendRequests", friendRequests);

  return res.status(200).json({
    success: true,
    message: "fetched friend request",
    friendRequests: friendRequests,
  });
};

export const friendRequestISent = async (req, res) => {
  const { userId } = req.params;
  const friendRequests = await Request.find({ sender: userId }).populate(
    "receiver",
    "name avatar"
  );

  if (friendRequests) {
    const receiverIds = friendRequests.map((request) => {
      return request.receiver._id;
    });
    return res.status(200).json({
      success: true,
      message: "fetched friend request",
      friendRequests,
      receiverIds,
    });
  }
  return errorHandler("Internal server error", 500, req, res);
};

export const myFriends = async (req, res) => {
  const { userId } = req.params;
  const allFriends = await User.findById(userId)
    .select("friends")
    .populate("friends", "name  avatar");

  const friendsList = allFriends.friends;
  const friendIds = friendsList.map((friend) => {
    return friend._id;
  });
  return res.status(200).json({
    success: true,
    message: "friends fetched",
    friendsList,
    friendIds,
  });
};
