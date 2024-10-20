import { Comment } from "../models/comment.js";
import { Post } from "../models/post.js";

export const createPost = async (req, res) => {
  //   const { userId, title, description, images } = req.body;
  const post = await Post.create(req.body);
  if (post) {
    return res.status(201).json({
      success: true,
      message: "Post created",
      post,
    });
  }
  return errorHandler("internal server error", 500, req, res);
};

export const fetchPosts = async (req, res) => {
  const posts = await Post.find()
    .sort({ createdAt: -1 })
    .populate("creator", "name");
  if (posts) {
    return res.status(200).json({
      success: true,
      message: "Fetched successfully",
      posts,
    });
  }
  return errorHandler("internal server error", 500, req, res);
};

export const fetchPostsByUSerId = async (req, res) => {
  const { userId } = req.params;
  const posts = await Post.find({ creator: userId }).populate(
    "creator",
    "name"
  );
  if (posts) {
    return res.status(200).json({
      success: true,
      message: "Fetched successfully",
      posts,
    });
  }
  return errorHandler("internal server error", 500, req, res);
};

export const postDetails = async (req, res) => {
  const { postId } = req.params;

  const post = await Post.findById(postId).populate("creator", "name");
  const comments = await Comment.find({ post: postId }).populate(
    "user",
    "name"
  );
  const postWithComments = JSON.parse(JSON.stringify(post));

  if (post && comments) {
    postWithComments.comments = [...comments];
    return res.status(200).json({
      success: true,
      message: "Fetched successfully",
      post: postWithComments,
    });
  }
  return errorHandler("internal server error", 500, req, res);
};
