const jwt = require('jsonwebtoken'),
  User = require('../models/user.model');


async function auth(req, res, next) {
  try {
    delete req.user;
    // gets the bearer token from the header
    const { authorization } = req.headers;

    if (authorization) {
      // isolates the jwt
      const token = authorization.split(` `)[1];

      // verify the jwt with the jsonwebtoken package
      const { email } = jwt.verify(token, process.env.TOKEN_SECRET);
      const foundUser = await User.findOne({ email });

      if (foundUser) {
        req.user = { id: foundUser.id, email: foundUser.email };
      }
    }

    next();
  } catch (err) {
    next(err);
  }
}


module.exports = auth;