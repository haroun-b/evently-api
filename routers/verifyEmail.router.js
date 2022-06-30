const router = require(`express`).Router(),
  User = require(`../models/User.model`),
  jwt = require(`jsonwebtoken`),
  nodemailer = require(`nodemailer`);

router.get(`/verify`, async (req, res, next) => {
  try {
    const verifToken = req.query.token;

    if (!verifToken) {
      res.status(400)
        .json({
          errors: {
            verifToken: `Verification token missing`
          }
        });
      return;
    }

    const { userId } = jwt.verify(verifToken, process.env.TOKEN_SECRET);


    const foundUser = await User.findByIdAndUpdate(
      userId,
      { isVerified: true },
      { new: true, select: { password: 0, __v: 0 } }
    );

    if (!foundUser) {
      handleNotExist(`userId`, userId, res);
      return;
    }

    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD
      }
    });

    // use .env for the from field
    const emailResMsg = await transporter.sendMail({
      from: `'Evently ' <${process.env.EMAIL_USERNAME}>`,
      to: foundUser.email,
      subject: 'Email Verification',
      text: `You are now a verified user!`
    });

    console.log(emailResMsg);

    res.status(200).json(foundUser);
  } catch (err) {
    err.unverifiedUser = req.query.email;
    next(err);
  }
});