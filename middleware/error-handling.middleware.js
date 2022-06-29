function notFound(req, res, next) {
  // runs whenever the requested resource is not found
  res.status(404)
    .json({
      errors: {
        resource: `Requested resource not found`
      }
    });
};

function internalError(err, req, res, next) {
  console.error("ERROR", req.method, req.path, err);

  if (err.name.includes(`Token`)) {
    let authentication = ``;

    if (err.message.includes(`jwt expired`)) {
      authentication = `Expired token. Please login to continue`;
    } else {
      authentication = `Invalid token`;
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
      res.status(400).json({ errors });
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
    res.status(404)
      .json({
        errors: {
          server: `Internal server error`
        }
      });
  }
}


module.exports = [notFound, internalError];