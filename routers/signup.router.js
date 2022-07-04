const {
    isValidPassword,
    handleInvalidPassword,
    handleImagePath,
  } = require(`../utils/helpers.function`),
  router = require(`express`).Router(),
  User = require(`../models/User.model`),
  bcrypt = require(`bcryptjs`),
  jwt = require(`jsonwebtoken`),
  nodemailer = require(`nodemailer`);
const uploader = require("../config/cloudinary.config");

// uploader.single("keyName of the input")
router.post("/", uploader.single("file"), async (req, res, next) => {
  try {
    const imageUrl = handleImagePath(req.file, "file");
    const { username, email, password } = req.body;

    if (!isValidPassword(password)) {
      handleInvalidPassword(res, next);
      return;
    }

    const salt = await bcrypt.genSalt(10),
      hashedPassword = await bcrypt.hash(password, salt);

    const createdUser = await User.create({
      username,
      name: username,
      email,
      password: hashedPassword,
      imageUrl,
    });

    const verifToken = jwt.sign(
      { userId: createdUser.id },
      process.env.TOKEN_SECRET,
      {
        algorithm: `HS256`,
        expiresIn: `15m`,
      }
    );

    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    // use .env for the from field
    const emailResMsg = await transporter.sendMail({
      from: `'Evently ' <${process.env.EMAIL_USERNAME}>`,
      to: createdUser.email,
      subject: "Email Verification",
      text: `${process.env.BASE_URL}/verify?email=${createdUser.email}&token=${verifToken}`,
    });

    console.log(emailResMsg);

    res.sendStatus(201);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
