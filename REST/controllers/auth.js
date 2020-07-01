const User = require("../models/user");
const { validationResult } = require("express-validator/check");
const bcrypt = require("bcryptjs");

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
    const hashedPW = await bcrypt.hash(password, 12);
    const user = new User({ email, password: hashedPW, name });
    await user.save();
    res.status(201).json({ message: "User created!", userId: user._id });
  } catch (err) {
    next(new HttpError(err.message, 500));
  }
};
