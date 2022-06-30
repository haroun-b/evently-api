const router = require("express").Router();
const User = require("../models/User.model");
const isIdValid = require("../middleware/idValidation.middleware");
const { handleNotExist } = require("../utils/helpers.function");

router.use(require("../middleware/auth.middleware"));

// Get my user info
router.get("/", async (req, res, next) => {
  try {
    const id = req.user.id;
    const userInfo = await User.findById(id);
    res.status(200).json(userInfo);
  } catch (error) {
    next(error);
  }
});

// Get other user info
router.get("/:id", isIdValid, async (req, res, next) => {
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

// Modify user profile
router.patch("/", async (req, res, next) => {
  try {
    const id = req.user.id;
    // User can only modify his 'name' and 'bio'
    const { name, bio } = req.body;
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { name, bio },
      { new: true }
    );
    res.status(200).json(updatedUser);
  } catch (error) {
    next(error);
  }
});

// Delete user profile
router.delete("/", async (req, res, next) => {
  try {
    const id = req.user.id;
    await User.findByIdAndDelete(id);
    res.sendStatus(204);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
