const {
  isValidPasswd,
  handleInvalidPasswd
} = require(`../utils/helpers.function`),
  router = require(`express`).Router(),
  User = require(`../models/user.model`),
  bcrypt = require(`bcryptjs`),
  jwt = require(`jsonwebtoken`),
  nodemailer = require(`nodemailer`);

router.post(`/login`, async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!isValidPasswd(password)) {
      handleInvalidPasswd(res, next);
      return;
    }

    const foundUser = await User.findOne({ email });
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