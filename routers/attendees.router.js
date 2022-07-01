const router = require("express").Router();
const Event = require("../models/Event.model");
const AttendanceRequest = require(`../models/AttendanceRequest.model`);
const { handleNotExist } = require("../utils/helpers.function");


// get all attendees for one event by event id
router.get(`/`, async (req, res, next) => {
  try {

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

// send an attendance request for an event by event id
router.post(`/`, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { eventId } = req.params;

    const foundAttendanceRequest = await AttendanceRequest.findOne(
      { user: req.user.id },
      { event: eventId }
    );

    if (foundAttendanceRequest) {
      res.status(201).json(foundAttendanceRequest);
      return;
    }

    // Checking if event exist
    const foundEvent = await Event.findById(eventId);
    if (!foundEvent) {
      handleNotExist(`event`, eventId, res);
      return;
    }

    // Checking if user needs approval to register to the event
    let status = "Pending";
    if (!foundEvent.approvalRequired) {
      status = "Approved";
    }

    // Create attendance request, approved if no need of approval
    const createdAttendanceRequest = await AttendanceRequest.create({
      user: userId,
      status,
      event: eventId,
    });

    res.status(201).json(createdAttendanceRequest);

  } catch (err) {
    next(err);
  }
});

// delete attendance request for an event by event id
router.delete(`/`, async (req, res, next) => {
  try {

  } catch (err) {
    next(err);
  }
});

// approve or reject an attendance request by event id and request id
router.patch(`/:requestId`, async (req, res, next) => {
  try {

  } catch (err) {
    next(err);
  }
});


module.exports = router;