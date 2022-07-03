const router = require("express").Router();
const validateIds = require(`../middleware/idValidation.middleware`);
const Event = require("../models/Event.model");
const Message = require("../models/Message.model");
const AttendanceRequest = require(`../models/AttendanceRequest.model`);


// ==========================================================
// access restricted to authenticated users only
// ==========================================================
router.use(require("../middleware/auth.middleware"));
router.use(require(`../middleware/accessRestricting.middleware`));
// ==========================================================

// TODO: add middleware to restrict acces to approved attendees

// get all messages for one event by event id
router.get(`/:eventId/messages`, async (req, res, next) => {
  try {
    const { user } = req;
    const { eventId } = req.params;


    const updatedMessage = await Message.findOneAndUpdate(
      {
        _id: messageId,
        author: user.id,
        createdAt: { $gte: Date.now() - 600000 }  //created less than 10min ago
      },
      {
        message
      },
      {
        runValidators: true,
        new: true
      }
    );

    res.status(200).json(updatedMessage);
  } catch (err) {
    next(err);
  }
});

// send a message for one event by event id
router.post(`/:eventId/messages`, validateIds, async (req, res, next) => {
  try {
    const { user } = req;
    const { eventId } = req.params;
    const { message } = req.body;

    const foundEvent = await Event.findById(eventId);

    if (!foundEvent) {
      handleNotExist(`event`, eventId, res);
      return;
    }

    const userIsApprovedAttendee = (await AttendanceRequest.findOne(
      {
        event: eventId,
        user: user.id,
        status: `approved`
      }
    )) !== null;


    if (!userIsApprovedAttendee && foundEvent.creator.toString() !== user.id) {
      res.sendStatus(401);
      return;
    }

    const createdMessage = await Message.create({
      event: eventId,
      author: user.id,
      message
    });

    res.status(201).json(createdMessage);
  } catch (err) {
    next(err);
  }
});

// edit a message for one event by event id and message id
router.patch(`/:eventId/messages/:messageId`, validateIds, async (req, res, next) => {
  try {
    const { user } = req;
    const { messageId } = req.params;
    const { message } = req.body;


    const updatedMessage = await Message.findOneAndUpdate(
      {
        _id: messageId,
        author: user.id,
        createdAt: { $gte: Date.now() - 600000 }  //created less than 10min ago
      },
      {
        message
      },
      {
        runValidators: true,
        new: true
      }
    );

    res.status(200).json(updatedMessage);
  } catch (err) {
    next(err);
  }
});

// delete a message for one event by event id and message id
router.delete(`:eventId/messages/:messageId`, async (req, res, next) => {
  try {

  } catch (err) {
    next(err);
  }
});


module.exports = router;