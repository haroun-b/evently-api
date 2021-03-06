const mongoose = require(`mongoose`);

function isValidId(id) {
  return mongoose.isValidObjectId(id);
}

function handleInvalidId(id, res) {
  res.status(400).json({
    errors: {
      id: `${id} is not a valid id`,
    },
  });
}

function isValidPassword(password) {
  return typeof password === "string" && password.length > 7;
}

function handleInvalidPassword(res) {
  res.status(400).json({
    errors: {
      password: `password must of type: 'string'. With at least 8 characters`,
    },
  });
}

function handleNotExist(key, value, res) {
  res.status(404).json({
    errors: {
      [key]: `'${value}' does not exist`,
    },
  });
}

function handleImagePath(reqFile, filename) {
  if (reqFile) {
    const imageUrl = reqFile.path;
    return imageUrl
  } else {
    return;
  }
}

module.exports = {
  isValidId,
  handleInvalidId,
  isValidPassword,
  handleInvalidPassword,
  handleNotExist,
  handleImagePath,
};
