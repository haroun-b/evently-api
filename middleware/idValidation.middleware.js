const { isValidId, handleInvalidId } = require(`../utils/helpers.function`);


function validateIds(req, res, next) {
  try {
    const idArray = Object.entries(req.params)
      .filter(([key, value]) => key.search(/id/gi) !== -1);

    for (const [key, value] of idArray) {
      if (!isValidId(value)) {
        handleInvalidId(value, res);
        return;
      }
    }

    next();
  } catch (err) {
    next(err);
  }
}


module.exports = validateIds;