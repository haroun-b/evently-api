const router = require("express").Router();
const User = require("../models/User.model");
const validateIds = require("../middleware/idValidation.middleware");
const { handleNotExist } = require("../utils/helpers.function");


// get a user's profile by user id
router.get("/:id", validateIds, async (req, res, next) => {
  try {
    const {id} = req.params;
    const userInfo = await User.findById(id, { username: 1, name: 1, bio: 1, badges: 1, imageUrl: 1 });

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