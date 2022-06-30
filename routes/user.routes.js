const router = require("express").Router();
// const isAuthenticated = require("../middleware/isAuthenticated");
const User = require("../models/User.model");

// Get my user info
router.get("/user", async (req, res, next) => {
  try {
    const id = req.user._id;
    const userInfo = await User.findById(id);
    res.status(200).json(userInfo);
  } catch (error) {
    next(error);
  }
});

// Get other user info
router.get("/user/:id", async (req, res, next) => {
  try {
    const id = req.params.id;
    const userInfo = await User.findById(id);
    res.status(200).json(userInfo);
  } catch (error) {
    next(error);
  }
});

// Modify user profile
router.patch("/user", async (req, res, next) => {
  try {
    const id = req.user._id;
    const update = req.body;
    const updatedUser = await User.findByIdAndUpdate(id, update);
    res.status(200).json(updatedUser);
  } catch (error) {
    next(error);
  }
});

// Delete user profile
router.delete("/user", async (req, res, next) => {
  try {
    const id = req.user._id;
    await User.findByIdAndDelete(id);
    res.status(204);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
