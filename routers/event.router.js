const router = require("express").Router();
const Event = require("../models/Event.model");
const AttendanceRequest = require("../models/AttendanceRequest.model");
// const User = require("../models/User.model");
// const isIdValid = require("../middleware/idValidation.middleware");
// const { handleNotExist } = require("../utils/helpers.function");

router.use(require("../middleware/auth.middleware"));

// Create event
router.post("/", async (req, res, next) => {
  try {
    const id = req.user.id;
    let {
      title,
      location,
      startAt,
      endAt,
      attendees,
      description,
      type,
      approvalRequired,
    } = req.body;
    startAt = new Date(startAt);
    endAt = new Date(endAt);
    const createdEvent = await Event.create({
      creator: id,
      title,
      location,
      startAt,
      endAt,
      attendees,
      description,
      type,
      approvalRequired,
    });
    res.status(201).json(createdEvent);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
