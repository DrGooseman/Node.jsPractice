const { validationResult } = require("express-validator/check");

const Post = require("../models/post");
const User = require("../models/user");
const HttpError = require("../models/http-error");
const io = require("../socket");

exports.getPosts = async (req, res, next) => {
  const currentPage = req.query.page || 1;
  const perPage = 2;

  try {
    const totalItems = await Post.find().countDocuments();

    const posts = await Post.find()
      .populate("creator")
      .skip((currentPage - 1) * perPage)
      .limit(perPage);
    res.status(200).json({
      messsage: "Fetched posts successfully.",
      posts,
    });
  } catch (err) {
    next(new HttpError(err.message, 500));
  }
};

exports.createPost = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new HttpError("Validation fails.", 422);
  }

  const title = req.body.title;
  const content = req.body.content;
  const post = new Post({
    title,
    content,
    imageUrl: "images/demo.jpg",
    creator: req.userId,
  });
  try {
    await post.save();
    const user = await User.find(req.userId);
    user.posts.push(post);
    await user.save();
    io.getIO().emit("posts", { actions: "create", post });
    res.status(201).json({
      message: "Post Created.",
      post: { ...post._doc, creator: { _id: req.userId, name: user.name } },
      creator: { _id: user._id, name: user.name },
    });
  } catch (err) {
    next(new HttpError(err.message, 500));
  }
};

exports.getPost = async (req, res, next) => {
  const postId = req.params.postId;
  try {
    const post = await Post.findById(postId);

    if (!post) throw new HttpError("Count not find post.", 404);

    res.status(200).json({ message: "Post fetched.", post });
  } catch (err) {
    next(new HttpError(err.message, 500));
  }
};

exports.updatePost = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new HttpError("Validation fails.", 422);
  }

  const postId = req.params.postId;
  const title = req.body.title;
  const content = req.body.content;

  try {
    const post = await Post.findById(postId);
    if (!post) throw new HttpError("Count not find post.", 404);
    if (post.creator.toString() !== req.userId)
      throw new HttpError("Not authorized.", 403);

    post.title = title;
    post.content = content;
    await post.save();

    res.status(200).json({ message: "Post updated.", post });
  } catch (err) {
    next(new HttpError(err.message, 500));
  }
};

exports.deletePost = async (req, res, next) => {
  const postId = req.params.postId;
  const post = await Post.findById(postId);

  try {
    if (!post) throw new HttpError("Count not find post.", 404);
    if (post.creator.toString() !== req.userId)
      throw new HttpError("Not authorized.", 403);
    //check logged in user

    await Post.findByIdAndRemove(postId);
    const user = await User.findById(req.userId);
    user.posts.pull(postId);
    await user.save();

    res.status(200).json({ message: "Deleted post." });
  } catch (err) {
    next(new HttpError(err.message, 500));
  }
};
