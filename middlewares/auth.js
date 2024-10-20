import { errorHandler } from "../utils/errorHandler.js";
import jwt from "jsonwebtoken";
export const isAuthenticated = async (req, res, next) => {
  // implement cookie later
  // const token = req.headers.authorization.split(" ")[1];
  // if (!token) {
  //   return errorHandler("token not found", 401, req, res);
  // }
  // const decodedData = await jwt.verify(token, process.env.JWT_SECRET);
  // if (!decodedData) {
  //   return errorHandler("invalid access token", 401, req, res);
  // }
  // req.userId = decodedData._id;
  next();
};
