const router = require("express").Router();
const Event = require("../models/Event.model");
const validateIds = require("../middleware/idValidation.middleware");
const { handleNotExist } = require("../utils/helpers.function");
const AttendanceRequest = require("../models/AttendanceRequest.model");
// const User = require("../models/User.model");
const requestIp = require("request-ip");
const geoip = require("geoip-lite");
const Message = require("../models/Message.model");
const MessageReceipt = require("../models/MessageReceipt.model");

// get events based on filter values
router.get(`/`, async (req, res, next) => {
  try {
    const filterQuery = {};

    let {
      longitude,
      latitude,
      searchRadius = 5,
      city,
      startAfter,
      endBefore,
      maxPrice,
      type,
      search,
      requiresApproval,
      isGroupEvent,
      page = 0,
    } = req.query;

    // console.log(req.query)
    // res.sendStatus(200)
    // return

    if (!longitude && !latitude) {
      if (city) {
        filterQuery["address.city"] = new RegExp(city, `ig`);
      } else {
        //use ip address
        const ip = requestIp.getClientIp(req);
        const ipLocation = geoip.lookup(ip);

        if (ipLocation) {
          ({
            ll: [latitude, longitude],
          } = ipLocation);

          ({ city } = ipLocation);
        }
      }
    }

    if (longitude && latitude) {
      filterQuery.location = {
        $geoWithin: {
          $centerSphere: [[longitude, latitude], searchRadius / 6378],
        },
      };
    }

    // TODO: handle date related errors

    if (startAfter) {
      filterQuery.startAt = { $gte: Date.parse(startAfter) };
    }

    if (endBefore) {
      filterQuery.endAt = { $lte: Date.parse(endBefore) };
    }

    if (maxPrice) {
      filterQuery.price = { $lte: maxPrice };
    }

    if (type) {
      filterQuery.type = type;
    }

    if (requiresApproval !== undefined) {
      filterQuery.approvalRequired = requiresApproval === `true` ? true : false;
    }

    if (isGroupEvent !== undefined) {
      if (isGroupEvent === `true`) {
        filterQuery.$or = [
          { "attendees.maximum": { $gt: 1 } },
          { "attendees.maximum": { $exists: false } },
        ];
      } else {
        filterQuery["attendees.maximum"] = 1;
      }
    }

    if (search) {
      filterQuery.$or = [
        { title: new RegExp(search, `ig`) },
        { description: new RegExp(search, `ig`) },
      ];
    }

    console.log({ filterQuery });
    let filteredEvents = await Event.find(
      filterQuery,
      {},
      { sort: { startAt: 1 }, skip: page * 2, limit: 2 }
    ).populate({
      path: `creator`,
      select: { password: 0, email: 0, __v: 0 },
    });

    // an array of promises when resolved becomes an array of numbers. where each number represent the count of all the approved attendees for the event with the same index in filteredEvents
    const EventsAttendeesCountPromises = [];

    filteredEvents.forEach((evnt) => {
      allEventsAttendeesPromises.push(
        AttendanceRequest.find({ event: evnt.id }, { status: `approved` })
      );
    });

    const EventsApprovedAttendeesCount = await Promise.all(
      EventsAttendeesCountPromises
    );

    filteredEvents.forEach((evnt, i) => {
      evnt._doc.attendees.approvedCount = EventsApprovedAttendeesCount[i];
    });

    res.status(200).json({ city, events: filteredEvents });
  } catch (err) {
    next(err);
  }
});

// ==========================================================
// users are authenticated but access is not restricted
// ==========================================================
router.use(require("../middleware/auth.middleware"));
// ==========================================================

// get event by id
router.get(`/:eventId`, validateIds, async (req, res, next) => {
  try {
    const { user } = req;
    const { eventId } = req.params;

    const foundEvent = await Event.findById(eventId).populate({
      path: `creator`,
      select: { password: 0, email: 0, __v: 0 },
    });

    if (!foundEvent) {
      handleNotExist(`event`, eventId, res);
      return;
    }

    if (foundEvent.creator.id === user?.id) {
      // appends all attendance requests to the found event
      foundEvent._doc.attendees.requests = await AttendanceRequest.find({
        event: eventId,
      });
    } else {
      // appends all approved attendance requests to the found event
      foundEvent._doc.attendees.approved = await AttendanceRequest.find(
        { event: eventId },
        { status: `approved` }
      );
    }

    res.status(200).json(foundEvent);
  } catch (err) {
    next(err);
  }
});

// ==========================================================
// access restricted to authenticated users only
// ==========================================================
router.use(require(`../middleware/accessRestricting.middleware`));
const uploader = require("../config/cloudinary.config");
const { handleImagePath } = require(`../utils/helpers.function`);
// ==========================================================

// create event
router.post("/", uploader.single("file"), async (req, res, next) => {
  try {
    const id = req.user.id;
    const imageUrl = handleImagePath(req.file, "file");
    let {
      title,
      address,
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
      address,
      location,
      startAt,
      endAt,
      attendees,
      description,
      type,
      imageUrl,
      approvalRequired,
    });
    res.status(201).json(createdEvent);
  } catch (error) {
    next(error);
  }
});

// edit event by id
router.patch(
  `/:eventId`,
  uploader.single("file"),
  validateIds,
  async (req, res, next) => {
    try {
      const { eventId } = req.params;

      const foundEvent = await Event.findById(eventId).populate({
        path: `creator`,
        select: { password: 0, email: 0, __v: 0 },
      });

      if (!foundEvent) {
        handleNotExist(`event`, eventId, res);
        return;
      }

      if (foundEvent.creator.id !== req.user.id) {
        res.status(403).json({
          errors: {
            event: `cannot edit an event you didn't create`,
          },
        });
        return;
      }

      const imageUrl = handleImagePath(req.file, "file");
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
          // creator: req.user.id,
          // Im not sure we need the creator here
          title,
          location,
          startAt,
          endAt,
          attendees,
          description,
          type,
          approvalRequired,
          imageUrl,
        },
        { runValidators: true, new: true }
      ).populate({
        path: `creator`,
        select: { password: 0, email: 0, __v: 0 },
      });

      res.status(200).json(updatedEvent);
    } catch (err) {
      next(err);
    }
  }
);

// delete event by id
router.delete(`/:eventId`, validateIds, async (req, res, next) => {
  try {
    const { user } = req,
      { eventId } = req.params;

    const foundEvent = await Event.findOne({ _id: eventId, creator: user.id });

    if (!foundEvent) {
      handleNotExist(`event`, eventId, res);
      return;
    }

    await Promise.all([
      MessageReceipt.deleteMany({ event: eventId }),
      Message.deleteMany({ event: eventId }),
      AttendanceRequest.deleteMany({ event: eventId }),
      Event.findByIdAndDelete(eventId),
    ]);

    res.sendStatus(204);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
