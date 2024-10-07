import {
  ALERT,
  NEW_ATTACHMENTS,
  NEW_MESSAGE_ALERT,
  REFETCH_CHATS,
} from "../constants/events.js";
import {
  getAvatarUrls,
  getOtherMembers,
  getOtherMembersName,
} from "../libs/helpers.js";
import { Chat } from "../models/chat.js";
import { Message } from "../models/message.js";
import { errorHandler } from "../utils/errorHandler.js";
import { emitEvent } from "../utils/features.js";
export const newGroupChat = async (req, res) => {
  try {
    const { name, members } = req.body;
    if (members.length < 2) {
      return errorHandler("minimum 3 members required", 404, req, res);
    }
    const allMembers = [...members, req.userId];
    const group = await Chat.create({
      name,
      groupChat: true,
      creator: req.userId,
      members: allMembers,
    });
    emitEvent(req, ALERT, allMembers, `welcome to ${name} group`);
    emitEvent(req, REFETCH_CHATS, members, `welcome to ${name} group`);
    return res.status(201).json({
      success: true,
      message: "group created",
      group,
    });
  } catch (error) {
    return errorHandler(error, 500, req, res);
  }
};

export const newChat = async (req, res) => {
  try {
    const { member } = req.body;
    console.log("member", member);

    if (!member) {
      return errorHandler("minimum 1 member required", 404, req, res);
    }
    const allMembers = [member, req.userId];
    const chat = await Chat.create({
      groupChat: false,
      creator: req.userId,
      members: allMembers,
    });
    emitEvent(req, ALERT, allMembers, `welcome to  group`);
    emitEvent(req, REFETCH_CHATS, member, `welcome to  group`);
    return res.status(201).json({
      success: true,
      message: "new chat created",
      chat,
    });
  } catch (error) {
    return errorHandler(error, 500, req, res);
  }
};

export const getMyChats = async (req, res) => {
  const { userId } = req.params;
  // try {
  const chats = await Chat.find({ members: userId }).populate(
    "members",
    "name avatar"
  );

  const transFormedChats = chats.map(({ _id, name, members, groupChat }) => {
    //   const otherMembers = getOtherMembers(members, req.userId);
    const otherMembersName = getOtherMembersName(members, req.userId);
    const avatarUrls = getAvatarUrls(members, req.userId);
    const memberIds = members.map((ele) => {
      return ele._id;
    });
    return {
      _id,
      groupChat,
      name: groupChat ? name : otherMembersName,
      members: memberIds,
      avatar: avatarUrls,
    };
  });
  return res.status(200).json({
    success: true,
    message: "my chats fetched",
    chats: transFormedChats,
  });
  // } catch (error) {
  //   return errorHandler(error, 500, req, res);
  // }
};

export const getMyGroups = async (req, res) => {
  // try {
  const { userId } = req.params;
  const chats = await Chat.find({
    members: userId,
    groupChat: true,
    creator: userId,
  }).populate("members", "name avatar");
  console.log("chats_", chats);

  const transFormedChats = chats.map(({ _id, name, members, groupChat }) => {
    const restMemberDetails = getOtherMembers(members, req.userId);
    const avatarUrls = getAvatarUrls(members, req.userId);
    const memberIds = members.map((ele) => {
      return ele._id;
    });
    return {
      _id,
      groupChat,
      avatars: avatarUrls,
      name: name,
      members: memberIds,
      memberDetails: restMemberDetails,
    };
  });
  return res.status(200).json({
    success: true,
    message: "my chats fetched",
    groups: transFormedChats,
  });
  // } catch (error) {
  //   return errorHandler(error, 500, req, res);
  // }
};

export const addMember = async (req, res) => {
  const { chatId, members } = req.body;

  const chat = await Chat.findById(chatId);
  if (!chat) {
    return errorHandler("Chat can not found", 404, req, res);
  }
  if (!chat.groupChat) {
    return errorHandler("This is not a group chat", 404, req, res);
  }
  if (chat.creator.toString() !== req.userId.toString()) {
    return errorHandler(
      "Only creator is allowed to add members",
      404,
      req,
      res
    );
  }
  const membersAlreadyExist = await Chat.find({ members: { $in: members } });
  if (membersAlreadyExist.length > 0) {
    return errorHandler("member already present in the group", 404, req, res);
  }

  const existingMember = chat.members;
  const updatedMembers = [...existingMember, ...members];
  const updatedChat = await Chat.findOneAndUpdate(
    { _id: chatId },
    { members: updatedMembers },
    { new: true }
  );
  emitEvent(req, ALERT, chat.members, `new members has been added to group`);
  emitEvent(
    req,
    REFETCH_CHATS,
    chat.members,
    `new members has been added to group`
  );
  return res.status(203).json({
    success: true,
    message: "Members added successfully",
    updatedChat,
  });
};

export const removeMember = async (req, res) => {
  const { chatId, members } = req.body;

  const chat = await Chat.findById(chatId);
  if (!chat) {
    return errorHandler("Chat can not found", 404, req, res);
  }
  if (!chat.groupChat) {
    return errorHandler("This is not a group chat", 404, req, res);
  }
  if (chat.creator.toString() !== req.userId.toString()) {
    return errorHandler(
      "Only creator is allowed to remove members",
      404,
      req,
      res
    );
  }
  const membersAlreadyExist = await Chat.find({ members: { $in: members } });
  if (membersAlreadyExist.length > 0) {
    const restMembers = chat.members.filter((member, index) => {
      return !members.includes(member.toString());
    });

    const updatedChat = await Chat.findOneAndUpdate(
      { _id: chatId },
      { members: restMembers },
      { new: true }
    );
    emitEvent(req, ALERT, chat.members, `memeber has been deleted from group`);
    emitEvent(
      req,
      REFETCH_CHATS,
      chat.members,
      `memeber has been deleted from group`
    );
    return res.status(201).json({
      success: true,
      message: "Members removed successfully",
      updatedChat,
    });
  }
  return errorHandler(
    "selected memebers dont exist in this group",
    404,
    req,
    res
  );
};

export const leaveGroup = async (req, res) => {
  const { chatId } = req.params;
  const userId = req.userId;
  console.log(userId);

  const chat = await Chat.findById(chatId);
  if (!chat) {
    return errorHandler("Chat can not found", 404, req, res);
  }
  if (!chat.groupChat) {
    return errorHandler("This is not a group chat", 404, req, res);
  }
  if (chat.creator.toString() === req.userId.toString()) {
    return errorHandler("Create can not leave the group", 404, req, res);
  }
  const isMemberExist = await Chat.find({ members: { $in: [userId] } });
  console.log("isMemberExist_", isMemberExist);

  if (isMemberExist.length > 0) {
    const restMembers = chat.members.filter((member, index) => {
      return member.toString() !== userId.toString();
    });
    console.log("restMembers", restMembers);

    const updatedChat = await Chat.findOneAndUpdate(
      { _id: chatId },
      { members: restMembers },
      { new: true }
    );
    emitEvent(req, ALERT, chat.members, `member left the group`);
    // emitEvent(req, REFETCH_CHATS, chat.members, `member left the group`);
    return res.status(201).json({
      success: true,
      message: `member left the group`,
      updatedChat,
    });
  }
  return errorHandler(
    "selected memebers dont exist in this group",
    404,
    req,
    res
  );
};

export const sendAttachment = async (req, res) => {
  const { chatId } = req.body;
  const userId = req.userId;
  console.log(userId);

  const chat = await Chat.findById(chatId);
  if (!chat) {
    return errorHandler("Chat can not found", 404, req, res);
  }
  const messageForRealTime = {
    content: "",
    sendAttachment: "",
    sender: {
      _id: req.userId,
      name: "name",
    },
    chat: chatId,
  };
  const attachment = {
    public_id: "dewfr",
    url: "dwef",
  };
  const messageForDb = {
    content: "",
    attachments: attachment,
    sender: req.user,
    chat: chatId,
    sender: req.userId,
  };
  const message = await Message.create(messageForDb);
  if (message) {
    emitEvent(req, NEW_ATTACHMENTS, chat.members, {
      message: messageForRealTime,
      chatId,
    });
    emitEvent(req, NEW_MESSAGE_ALERT, chat.members, {
      chatId,
    });
    return res.status(201).json({
      success: true,
      message: "message created",
    });
  }

  return errorHandler(
    "selected memebers dont exist in this group",
    404,
    req,
    res
  );
};

export const sendMessage = async (req, res) => {
  const { chatId } = req.body;
  const userId = req.userId;
  console.log(userId);

  const chat = await Chat.findById(chatId);
  if (!chat) {
    return errorHandler("Chat can not found", 404, req, res);
  }
  const messageForRealTime = {
    content: "",
    sendAttachment: "",
    sender: {
      _id: req.userId,
      name: "name",
    },
    chat: chatId,
  };
  const attachment = {
    public_id: "dewfr",
    url: "dwef",
  };
  const messageForDb = {
    content: "",
    attachments: attachment,
    chat: chatId,
    sender: req.userId,
  };
  const message = await Message.create(messageForDb);
  if (message) {
    emitEvent(req, NEW_ATTACHMENTS, chat.members, {
      message: messageForRealTime,
      chatId,
    });
    emitEvent(req, NEW_MESSAGE_ALERT, chat.members, {
      chatId,
    });
    return res.status(201).json({
      success: true,
      message: "message created",
    });
  }

  return errorHandler(
    "selected memebers does not exist in this group",
    404,
    req,
    res
  );
};

export const chatDetails = async (req, res) => {
  const { id } = req.params;

  const chat = await Chat.findOne({ _id: id }).populate(
    "members",
    "name avatar"
  );
  if (!chat) {
    return errorHandler("chat does not exist", 401, req, res);
  }
  return res.status(200).json({
    success: true,
    message: "chat fetched",
    chat,
  });
};
export const renameGroup = async (req, res) => {
  const { chatId, name } = req.body;

  const chat = await Chat.findOne({ _id: chatId });
  if (!chat) {
    return errorHandler("chat does not exist", 404, req, res);
  }
  if (!chat.groupChat) {
    return errorHandler("This is not a group chat", 404, req, res);
  }
  const updatedChat = await Chat.findOneAndUpdate(
    { _id: chatId },
    { name },
    { new: true }
  );
  if (updatedChat) {
    return res.status(201).json({
      success: true,
      message: "group renamed successfully",
      updatedGroup: updatedChat,
    });
  }
  return errorHandler("Internal server error", 500, req, res);
};

export const deleteGroup = async (req, res) => {
  const { chatId } = req.params;

  const userId = req.userId;
  console.log("userId", userId);

  const chat = await Chat.findOne({ _id: chatId });
  if (!chat) {
    return errorHandler("chat does not exist", 404, req, res);
  }
  if (!chat.groupChat) {
    return errorHandler("This is not a group chat", 401, req, res);
  }
  if (chat.creator.toString() !== userId.toString()) {
    return errorHandler("only creator can delete the group", 401, req, res);
  }
  await Chat.findOneAndDelete({ _id: chatId });
  return res.status(204).json();
};
export const gatMessages = async (req, res) => {
  const { chatId } = req.params;
  const chat = await Chat.findOne({ _id: chatId });
  if (!chat) {
    return errorHandler("chat does not exist", 404, req, res);
  }
  const messages = await Message.find({ chat: chatId }).populate(
    "sender",
    "name avatar"
  );
  if (messages) {
    return res.status(201).json({
      success: true,
      message: "messages fetched",
      data: messages,
    });
  }
  emitEvent(req, REFETCH_CHATS, chat.members);
  return errorHandler("Internal server error", 500, req, res);
};
