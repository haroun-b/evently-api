const router = require("express").Router();
const Event = require("../models/Event.model");
const AttendanceRequest = require("../models/AttendanceRequest.model");

router.use(require("../middleware/auth.middleware"));

// Send attendance request
router.post("/", async (req, res, next) => {
  try {
    const id = req.user.id;
    const { event } = req.body;

    // Checking if event exist
    const foundEvent = await Event.findById(event);
    if (!foundEvent) {
      res.status(404).json({ message: "This event does not exist" });
      return;
    }

    // Checking if user needs approval to register to the event
    let status = "Pending";
    if (!foundEvent.approvalRequired) {
      status = "Approved";
    }

    // Create attendance request, approved if no need of approval
    const createdAttendanceRequest = await AttendanceRequest.create({
      user: id,
      status,
      event,
    });

    res.status(201).json(createdAttendanceRequest);
  } catch (error) {
    next(error);
  }
});

// Answer attendance request
router.patch("/", async (req, res, next) => {
  try {
    const id = req.user.id;
    const { requestId, status, eventId } = req.body;

    // Check if request exist
    const foundRequest = AttendanceRequest.findById(requestId);
    if (!foundRequest) {
      res.status(404).json({ message: "This request does not exist" });
      return;
    }

    // Checking if the user is the creator of the event, so he can modify it
    // Or if the request exist, in any case we send the same message
    const foundEvent = await Event.findOne({ _id: eventId, user: id });
    if (!foundEvent) {
      res.status(403).json({ message: "You are not this event creator" });
      return;
    }

    // Update the event status to "approved" of "rejected"
    const updatedAttendanceRequest = await AttendanceRequest.findByIdAndUpdate(
      requestId,
      { status },
      { new: true }
    );

    res.status(200).json(updatedAttendanceRequest);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
