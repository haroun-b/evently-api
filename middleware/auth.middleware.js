const jwt = require("jsonwebtoken"),
  User = require("../models/User.model");

async function auth(req, res, next) {
  try {
    delete req.user;
    // gets the bearer token from the header
    const { authorization } = req.headers;

    if (authorization) {
      // isolates the jwt
      const token = authorization.split(` `)[1];

      // verify the jwt with the jsonwebtoken package
      const { userId } = jwt.verify(token, process.env.TOKEN_SECRET);
      const foundUser = await User.findById(userId, { password: 0, __v: 0 });

      if (foundUser) {
        req.user = foundUser;
      }
    }

    next();
  } catch (err) {
    next(err);
  }
}

module.exports = auth;
