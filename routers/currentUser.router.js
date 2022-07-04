const router = require("express").Router();
const User = require("../models/User.model");
const Event = require("../models/Event.model");
const AttendanceRequest = require(`../models/AttendanceRequest.model`);

// ==========================================================
// access restricted to authenticated users only
// ==========================================================
router.use(require("../middleware/auth.middleware"));
router.use(require(`../middleware/accessRestricting.middleware`));
// ==========================================================

// get the current user's profile
router.get("/", async (req, res, next) => {
  try {
    const { id } = req.user;
    const userInfo = await User.findById(id, {
      password: 0,
      isVerified: 0,
      __v: 0,
    });

    res.status(200).json(userInfo);
  } catch (error) {
    next(error);
  }
});

// edit the current user's profile
const { handleImagePath } = require(`../utils/helpers.function`);
const uploader = require("../config/cloudinary.config");

router.patch("/", uploader.single("file"), async (req, res, next) => {
  try {
    const id = req.user.id;

    // User can only modify his 'name', 'bio' and 'image'
    const imageUrl = handleImagePath(req.file, "file");
    const { name, bio } = req.body;
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { name, bio, imageUrl },
      { new: true }
    );
    res.status(200).json(updatedUser);
  } catch (error) {
    next(error);
  }
});

// delete the current user's profile
router.delete("/", async (req, res, next) => {
  try {
    const id = req.user.id;
    await User.findByIdAndDelete(id);
    res.sendStatus(204);
  } catch (error) {
    next(error);
  }
});

// get all events for the current user
router.get(`/events`, async (req, res, next) => {
  try {
    const { user } = req;

    const createdByUser = await Event.find({ creator: user.id });
    const attendedByUser = await AttendanceRequest.find({
      user: user.id,
    }).populate(`event`);

    res.status(200).json({ createdByUser, attendedByUser });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
