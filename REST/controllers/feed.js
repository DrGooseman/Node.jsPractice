const { validationResult } = require("express-validator/check");

const Post = require("../models/post");
const HttpError = require("../models/http-error");

exports.getPosts = async (req, res, next) => {
  try {
    const posts = await Post.find();
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
    creator: { name: "James" },
  });
  try {
    await post.save();
    res.status(201).json({
      message: "Post Created.",
      post,
    });
  } catch (err) {
    next(new HttpError(err.message, 500));
  }
};

exports.getPost = async (req, res, next) => {
  const postId = req.params.postId;
  try {
    const post = await Post.findById(postId);

    if (!post) throw new HttpError("Validation fails.", 422);

    res.status(200).json({ message: "Post fetched.", post });
  } catch (err) {
    next(new HttpError(err.message, 500));
  }
};
