const {
  isValidPassword,
  handleInvalidPassword,
} = require(`../utils/helpers.function`),
  router = require(`express`).Router(),
  User = require(`../models/User.model`),
  bcrypt = require(`bcryptjs`),
  jwt = require(`jsonwebtoken`),
  nodemailer = require(`nodemailer`);

  
router.patch(`/`, async (req, res, next) => {
  try {
    const { email, password } = req.body;
    let resetToken = req.query.token;

    if (resetToken) {
      const { userId } = jwt.verify(resetToken, process.env.TOKEN_SECRET);
      if (!password) {
        res.status(400)
          .json({
            errors: {
              password: `to reset your password, please provide a new one`
            }
          });
        return;
      }

      if (!isValidPassword(password)) {
        handleInvalidPassword(res);
        return;
      }

      const salt = await bcrypt.genSalt(10),
        hashedPassword = await bcrypt.hash(password, salt);

      await User.findByIdAndUpdate(userId, { password: hashedPassword });

      res.status(200).json({ message: `password successfully updated! please login to continue` });
      return;
    }

    if (!email) {
      res.status(400)
        .json({
          errors: {
            email: `to reset your password, please provide an email`
          }
        });
      return;
    }

    const foundUser = await User.findOne({ email });
    if (!foundUser) {
      handleNotExist(`user`, email, res);
      return;
    }
    

    resetToken = jwt.sign({ userId: foundUser.id }, process.env.TOKEN_SECRET, {
      algorithm: `HS256`,
      expiresIn: `5m`,
    });


    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.APP_PASSWORD,
      },
    });

    // use .env for the from field
    const emailResMsg = await transporter.sendMail({
      from: `Evently <${process.env.EMAIL_USERNAME}>`,
      to: foundUser.email,
      subject: "Password Reset",
      text: `${process.env.BASE_URL}/reset-password/?token=${resetToken}`
    });

    console.log(emailResMsg);

    res.status(200).json({ message: `password reset link sent` });
  } catch (err) {
    next(err);
  }
});


module.exports = router;