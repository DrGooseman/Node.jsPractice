const { validationResult } = require("express-validator/check");

const Post = require("../models/post");

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
  if (!errors.isEmpty())
    return res.status(422).json({ message: "Validation fails.", errors });
  const title = req.body.title;
  const content = req.body.content;
  const post = new Post({
    title,
    content,
    creator: { name: "James" },
  });
  await post.save();
  res.status(201).json({
    message: "Post Created.",
    post,
  });
};
