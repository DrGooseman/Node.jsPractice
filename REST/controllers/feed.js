const { validationResult } = require("express-validator/check");

const Post = require("../models/post");
const HttpError = require("../models/http-error");

exports.getPosts = (req, res, next) => {
  res.status(200).json({
    posts: [
      {
        _id: "1",
        title: "First Post",
        content: "This is the first post!",
        imageUrl: "images/demo.jpg",
        creator: {
          name: "James",
          createdAt: new Date(),
        },
      },
    ],
  });
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

exports.getPost = (req, res, next) => {
  const postId = req.params.postId;
  Post.findById(postId);
};
