import _ from "lodash";
import { userSocketIds } from "../app.js";

export const getOtherMembers = (members, userId) => {
  const otherMembers = members.filter((memebr) => {
    return memebr._id.toString() !== userId.toString();
  });
  return otherMembers;
};
export const getOtherMembersName = (members, userId) => {
  const otherMembersName = members.map((member) => {
    if (member._id.toString() !== userId) return member.name;
  });
  const otherMembersNameWithOutNull = _.compact(otherMembersName);
  return otherMembersNameWithOutNull;
};
export const getAvatarUrls = (members, userId) => {
  const avatarUrls = members.map((member) => {
    if (member._id.toString() !== userId.toString()) return member.avatar.url;
  });

  return _.compact(avatarUrls);
};

export const getAvatar = (users) => {
  const avatars = users.map((member) => {
    member.avatar.url;
  });

  return _.compact(avatarUrls);
};
export const getSockets = (users = []) => {
  console.log("users", users);
  return users.map((user) => userSocketIds.get(user.toString()));
};
