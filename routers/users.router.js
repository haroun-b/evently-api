const router = require("express").Router();
const User = require("../models/User.model");
const validateId = require("../middleware/idValidation.middleware");
const { handleNotExist } = require("../utils/helpers.function");


// get a user's profile by user id
router.get("/:id", validateId, async (req, res, next) => {
  try {
    const id = req.params.id;
    const userInfo = await User.findById(id);
    if (!userInfo) {
      handleNotExist("userId", id, res);
      return;
    }
    res.status(200).json(userInfo);
  } catch (error) {
    next(error);
  }
});


module.exports = router;