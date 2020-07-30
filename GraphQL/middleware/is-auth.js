const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  const authHeader = get("Authorization");
  if (!authHeader) {
    req.isAuth = false;
    return next();
  } //throw new HttpError("Not authenticated.", 401);

  const token = req.authHeader.split(" ")[1];
  let decodedToken;

  try {
    decodedToken = jwt.verify(token, process.env.SECRET);
  } catch (err) {
    {
      req.isAuth = false;
      return next();
    } //next(new HttpError(err.message, 500));
  }

  if (!decodedToken) {
    req.isAuth = false;
    return next();
  } //throw new HttpError("Not authenticated.", 401);

  req.userId = decodedToken.userId;
  req.isAuth = true;
  next();
};
