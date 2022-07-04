const User = require(`../models/User.model`),
  jwt = require(`jsonwebtoken`),
  nodemailer = require(`nodemailer`);


function notFound(req, res, next) {
  // runs whenever the requested resource is not found
  res.status(404)
    .json({
      errors: {
        resource: `requested resource not found`
      }
    });
};

async function internalError(err, req, res, next) {
  console.error("ERROR", req.method, req.path, err);

  if (err.name.includes(`Token`)) {
    let authentication = ``;

    if (err.message.includes(`jwt expired`)) {
      if (err.unverifiedUser) {
        const foundUser = await User.findOne({ email: unverifiedUser });
        if (foundUser) {
          const verifToken = jwt.sign({ userId: foundUser.id }, process.env.TOKEN_SECRET, {
            algorithm: `HS256`,
            expiresIn: `15m`,
          });

          const transporter = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
              user: process.env.EMAIL_USERNAME,
              pass: process.env.APP_PASSWORD
            }
          });

          // use .env for the from field
          const emailResMsg = await transporter.sendMail({
            from: `Evently <${process.env.EMAIL_USERNAME}>`,
            to: foundUser.email,
            subject: 'Email Verification',
            text: `${process.env.BASE_URL}/verify/?email=${foundUser.email}&token=${verifToken}`
          });

          console.log(emailResMsg);
        }
      }

      authentication = `expired token`;
    } else {
      authentication = `invalid token`;
    }

    res.status(401).json({ authentication });
    return;
  }

  const mongooseErrors = [`ValidatorError`, `CastError`, `ValidationError`, `MongoServerError`];
  if (mongooseErrors.includes(err.name)) {
    let errors = {};


    if (err.code === 11000) {
      errors = err.keyValue;
      const key = Object.entries(errors).flat()[0];

      errors[key] += ` already exists. Try logging in instead`;
      res.status(401).json({ errors });
      return;
    }

    if (!err.errors) {
      err.errors = [err];
    }

    for (let e in err.errors) {
      e = err.errors[e];

      switch (e.kind) {
        case `required`:
          errors[e.path] = `${e.path} is required`;
          break;
        case `string`:
          errors[e.path] = `${e.path} must be of type: 'string'`;
          break;
        default:
          errors[e.path] = e.path === `email` ? `${e.message}` : `${e.path} ${e.message}`;
      }
    }

    res.status(400).json({ errors });
    return;
  }

  // only renders if the error occurred before sending the response
  if (!res.headersSent) {
    res.status(500)
      .json({
        errors: {
          server: `internal server error`
        }
      });
  }
}


module.exports = [notFound, internalError];