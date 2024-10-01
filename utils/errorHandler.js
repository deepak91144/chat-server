export const errorHandler = (message, statusCode, req, res) => {
  const msg = message || "Internal Server Error";
  const code = statusCode || 500;
  return res.status(code).json({ success: false, message: msg });
};
