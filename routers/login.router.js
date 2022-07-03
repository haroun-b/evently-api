const {
  isValidPassword,
  handleInvalidPassword,
  handleNotExist
} = require(`../utils/helpers.function`),
  router = require(`express`).Router(),
  User = require(`../models/User.model`),
  bcrypt = require(`bcryptjs`),
  jwt = require(`jsonwebtoken`);

// TODO: update login to expect credentials instead of username or email
router.post(`/`, async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    if (!isValidPassword(password)) {
      handleInvalidPassword(res, next);
      return;
    }

    const searchQuery = username ? {username} : {email};
    const foundUser = await User.findOne(searchQuery);
    if (!foundUser) {
      handleNotExist(`email`, email, res);
      return;
    }

    const isPasswordMatched = await bcrypt.compare(password, foundUser.password);
    if (!isPasswordMatched) {
      res.status(401)
        .json({
          errors: {
            password: `Wrong password`
          }
        });
      return;
    }

    if (!foundUser.isVerified) {
      res.status(401)
        .json({
          errors: {
            verification: `Account not verified`
          }
        });
      return;
    }

    const authToken = jwt.sign({ userId: foundUser.id }, process.env.TOKEN_SECRET, {
      algorithm: `HS256`,
      expiresIn: `12h`,
    });

    res.status(200).json({ email, authToken });
  } catch (err) {
    next(err);
  }
});


module.exports = router;