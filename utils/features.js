import jwt from "jsonwebtoken";
export const cookieOptions = {
  maxAge: 15 * 24 * 60 * 60 * 1000,
  sameSite: "none",
  httpOnly: true,
  secure: true,
};
export const sendToken = async (res, user, code, message) => {
  console.log("user", user._id);

  const token = await jwt.sign({ _id: user._id }, process.env.JWT_SECRET);
  return res.status(code).cookie("chatAppToken", token, cookieOptions).json({
    success: true,
    token,
    message,
    user,
  });
};

export const emitEvent = (req, event, users, data) => {
  console.log("emiting event");
};
