const router = require("express").Router();
const Event = require("../models/Event.model");
const validateId = require("../middleware/idValidation.middleware");
const { handleNotExist } = require("../utils/helpers.function");
// const User = require("../models/User.model");


// get events based on filter values
router.get(`/`, async (req, res, next) => {
  try {

  } catch (err) {
    next(err);
  }
});

// get event by id
router.get(`/:eventId`, validateId, async (req, res, next) => {
  try {
    const { eventId } = req.params;

    const foundEvent = await Event.findById(eventId)
    .populate({ path: `creator`, select: { password: 0, email: 0, __v: 0 } });

    if (!foundEvent) {
      handleNotExist(`event`, eventId, res);
      return;
    }

    res.status(200).json(foundEvent);
  } catch (err) {
    next(err);
  }
});


// ==========================================================
// access restricted to authenticated users only
// ==========================================================
router.use(require("../middleware/auth.middleware"));
router.use(require(`../middleware/accessRestricting.middleware`));
// ==========================================================

// create event
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

// edit event by id
router.patch(`/:eventId`, validateId, async (req, res, next) => {
  try {
    const { eventId } = req.params;

    const foundEvent = await Event.findById(eventId)
      .populate({ path: `creator`, select: { password: 0, email: 0, __v: 0 } });

    if (!foundEvent) {
      handleNotExist(`event`, eventId, res);
      return;
    }

    if (foundEvent.creator.id !== req.user.id) {
      res.status(403)
        .json({
          errors: {
            event: `cannot edit an event you didn't create`
          }
        });
      return;
    }

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

    const updatedEvent = await Event.findByIdAndUpdate(
      eventId,
      {
        creator: req.user.id,
        title,
        location,
        startAt,
        endAt,
        attendees,
        description,
        type,
        approvalRequired,
      },
      { runValidators: true, new: true }
    ).populate({ path: `creator`, select: { password: 0, email: 0, __v: 0 } });


    res.status(200).json(updatedEvent);
  } catch (err) {
    next(err);
  }
});

// delete event by id
router.delete(`/:eventId`, validateId, async (req, res, next) => {
  try {

  } catch (err) {
    next(err);
  }
});


module.exports = router;