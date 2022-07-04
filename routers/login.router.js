const {
  handleNotExist
} = require(`../utils/helpers.function`),
  router = require(`express`).Router(),
  User = require(`../models/User.model`),
  bcrypt = require(`bcryptjs`),
  jwt = require(`jsonwebtoken`);


router.post(`/`, async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    const credential = username ? {username} : {email};
    const foundUser = await User.findOne(credential);
    if (!foundUser) {
      handleNotExist(`user`, username || email, res);
      return;
    }

    const isPasswordMatched = await bcrypt.compare(password, foundUser.password);
    if (!isPasswordMatched) {
      res.status(401)
        .json({
          errors: {
            password: `wrong password`
          }
        });
      return;
    }

    if (!foundUser.isVerified) {
      res.status(401)
        .json({
          errors: {
            verification: `account not verified`
          }
        });
      return;
    }

    const authToken = jwt.sign({ userId: foundUser.id }, process.env.TOKEN_SECRET, {
      algorithm: `HS256`,
      expiresIn: `7d`,
    });

    res.status(200).json({ username, email, authToken });
  } catch (err) {
    next(err);
  }
});


module.exports = router;