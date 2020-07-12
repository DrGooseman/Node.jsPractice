const jwt = require("jsonwebtoken");

module.exports = (res, res, next) => {
  const authHeader = get("Authorization");
  if (!authHeader) throw new HttpError("Not authenticated.", 401);

  const token = req.authHeader.split(" ")[1];
  let decodedToken;

  try {
    decodedToken = jwt.verify(token, process.env.SECRET);
  } catch (err) {
    next(new HttpError(err.message, 500));
  }

  if (!decodedToken) throw new HttpError("Not authenticated.", 401);

  req.userId = decodedToken.userId;
};
