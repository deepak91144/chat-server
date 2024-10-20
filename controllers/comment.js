import { Comment } from "../models/comment.js";
import { Post } from "../models/post.js";
import { errorHandler } from "../utils/errorHandler.js";

export const addComment = async (req, res) => {
  const post = req.body;
  const comment = await Comment.create(post);
  if (comment) {
    await Post.findOneAndUpdate(
      { _id: post.post },
      { $push: { comments: comment._id } }
    );
    return res.status(201).json({
      success: true,
      message: "comment added",
      comment,
    });
  }
  return errorHandler("Internal server error", 500, req, res);
};

export const fetchComments = async () => {
  const { postId } = req.params;
  const comments = await Comment.find({ post: postId }).populate(
    "User",
    "name"
  );
  if (comment) {
    return res.status(2001).json({
      success: true,
      message: "comment added",
      comments,
    });
  }
  return errorHandler("Internal server error", 500, req, res);
};
