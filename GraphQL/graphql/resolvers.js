const bcrypt = require("bcryptjs");
const validator = require("validator");
const jwt = require("jsonwebtoken");

const User = require("../models/user");
const HttpError = require("../models/http-error");

module.exports = {
  createUser: async function ({ userInput }, req) {
    const existingUser = await User.findOne({ email: userInput.email });

    if (existingUser) throw new HttpError("User exists already!", 409);

    const hashedPw = await bcrypt.hash(userInput.password, 12);
    const user = new User({
      email: userInput.email,
      name: userInput.name,
      password: hashedPw,
    });
    const createdUser = await user.save();

    return {
      ...createdUser._doc,
      _id: createdUser._id.toString(),
    };
  },
  login: async function ({ email, password }, req) {
    const user = await User.findOne({ email });
    if (!user) throw new HttpError("User not found!", 401);
    const isEqual = bcrypt.compare(password, user.password);
    if (!isEqual) throw new HttpError("Password is incorrect!", 401);
    const token = jwt.sign(
      {
        userId: user._id.toString(),
        email: user.email,
      },
      process.env.SECRET,
      { expiresIn: "1h" }
    );
    return { token, userId: user._id.toString() };
  },
  getUsers: async function (req) {
    const users = await User.find();
    console.log(users);
    return users;
  },
};
