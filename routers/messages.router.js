const router = require("express").Router();
const validateIds = require(`../middleware/idValidation.middleware`);
const Event = require("../models/Event.model");
const Message = require("../models/Message.model");
const AttendanceRequest = require(`../models/AttendanceRequest.model`);
const { handleNotExist } = require("../utils/helpers.function");
const MessageReceipt = require("../models/MessageReceipt.model");


// ==========================================================
// access restricted to authenticated users only
// ==========================================================
router.use(require("../middleware/auth.middleware"));
router.use(require(`../middleware/accessRestricting.middleware`));
// ==========================================================

// TODO: add middleware to restrict acces to approved attendees

// get all messages for one event by event id
router.get(`/events/:eventId`, validateIds, async (req, res, next) => {
  try {
    const { user } = req;
    const { eventId } = req.params;
    const page = parseInt(req.query.page) || 0;

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

    const eventMessages = await Message.find(
      { event: eventId },
      {},
      {
        sort: { createdAt: 1 },
        limit: 50,
        skip: 50 * page,
        select: {__v: 0}
      }
    )

    const msgReceiptPromises = [];

    eventMessages.forEach(msg => {
      msgReceiptPromises.push(
        MessageReceipt.find(
          { message: msg.id },
          {read: 1, _id: 0}
        ).populate(
          {
            path: `read.by`,
            select: {name: 1, imageUrl: 1}
          }
        )
      )
    });

    const msgReceipts = await Promise.all(msgReceiptPromises);

    eventMessages.forEach((msg, i) => {
      msg._doc.read = msgReceipts[i].map(receipt => receipt.read);
    });

    res.status(200).json(eventMessages);

    // read receipts
    const userReceiptPromises = [];

    eventMessages.forEach(msg => {
      userReceiptPromises.push(
        MessageReceipt.findOne(
          { message: msg.id, "read.by": user.id }
        )
      )
    });

    const userReceipts = await Promise.all(userReceiptPromises);

    userReceipts.forEach((receipt, i) => {
      if (!receipt) {
        MessageReceipt.create(
          {
            message: eventMessages[i].id,
            read: {
              by: user.id,
              at: Date.now()
            }
          }
        )
      }
    });

  } catch (err) {
    next(err);
  }
});

// send a message for one event by event id
router.post(`/events/:eventId`, validateIds, async (req, res, next) => {
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
router.patch(`/:messageId`, validateIds, async (req, res, next) => {
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
router.delete(`/:messageId`, validateIds, async (req, res, next) => {
  try {
    const { messageId } = req.params;
    const { user } = req;

    const foundMessage = await Message.findById(messageId);

    if (!foundMessage) {
      handleNotExist(`message`, messageId, res);
      return;
    }

    if (foundMessage.author.toString() !== user.id) {
      res.sendStatus(403);
      return;
    }

    await Message.findByIdAndUpdate(messageId, { author: null, message: null });

    res.sendStatus(204);
  } catch (err) {
    next(err);
  }
});


module.exports = router;