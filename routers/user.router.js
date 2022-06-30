const router = require("express").Router();
const User = require("../models/User.model");


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
router.get("/:id", async (req, res, next) => {
  try {
    const id = req.params.id;
    const userInfo = await User.findById(id);
    res.status(200).json(userInfo);
  } catch (error) {
    next(error);
  }
});

// Modify user profile
router.patch("/", async (req, res, next) => {
  try {
    const id = req.user.id;
    const update = req.body;
    const updatedUser = await User.findByIdAndUpdate(id, update);
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
    res.status(204);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
