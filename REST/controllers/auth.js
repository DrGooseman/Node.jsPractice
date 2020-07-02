const User = require("../models/user");
const { validationResult } = require("express-validator/check");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const HttpError = require("../models/http-error");

exports.signup = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    throw new HttpError("Validation fails.", 422);
  }
  const email = req.body.email;
  const name = req.body.name;
  const password = req.body.password;
  try {
    const existingUser = User.findOne(email);
    if (existingUser) next("User already exists", 409);
    const hashedPW = await bcrypt.hash(password, 12);
    const user = new User({ email, password: hashedPW, name });
    await user.save();
    res.status(201).json({ message: "User created!", userId: user._id });
  } catch (err) {
    next(new HttpError(err.message, 500));
  }
};

exports.login = async (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  try {
    const user = User.findOne(email);
    if (!user) throw new HttpError("Username or password was incorrect.", 401);
    const passwordCorrect = await bcrypt.compare(password, user.password);
    if (!passwordCorrect)
      throw new HttpError("Username or password was incorrect.", 401);

    const token = jwt.sign(
      {
        email,
        userId: user._id,
      },
      process.env.SECRET,
      { expiresIn: "1h" }
    );

    res.status(200).json({ token, userId: user._id.toString() });
  } catch (err) {
    next(new HttpError(err.message, 500));
  }
};
