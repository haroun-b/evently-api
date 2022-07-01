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
    const userId = req.user.id;
    const { eventId } = req.params;

    await AttendanceRequest.findOneAndDelete(
      { user: req.user.id },
      { event: eventId }
    );

    res.sendStatus(204);
  } catch (err) {
    next(err);
  }
});

// approve or reject an attendance request by event id and request id
router.patch(`/:requestId`, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { eventId, requestId } = req.params;
    const { status } = req.body;

    // Check if request exist
    const foundRequest = AttendanceRequest.findById(requestId);
    if (!foundRequest) {
      handleNotExist(`attendaceRequest`, requestId, res);
      return;
    }

    // Checking if the user is the creator of the event, so he can modify it
    // Or if the request exist, in any case we send the same message
    const foundEvent = await Event.findOne({ _id: eventId, creator: userId });
    if (!foundEvent) {
      res.status(403).json({ message: "You are not this event creator" });
      return;
    }

    // Update the event status to "approved" of "rejected"
    const updatedAttendanceRequest = await AttendanceRequest.findByIdAndUpdate(
      requestId,
      { status },
      { runValidators: true, new: true }
    );

    res.status(200).json(updatedAttendanceRequest);
  } catch (err) {
    next(err);
  }
});


module.exports = router;