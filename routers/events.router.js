const router = require("express").Router();
const Event = require("../models/Event.model");
const validateId = require("../middleware/idValidation.middleware");
const { handleNotExist } = require("../utils/helpers.function");
const AttendanceRequest = require("../models/AttendanceRequest.model");
// const User = require("../models/User.model");
const requestIp = require('request-ip');
const geoip = require("geoip-lite");


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
      page = 0
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
          ({ ll: [latitude, longitude] } = ipLocation);

          ({ city } = ipLocation);
        }

      }
    }


    if (longitude && latitude) {
      filterQuery.location = {
        $geoWithin: {
          $centerSphere: [
            [longitude, latitude],
            searchRadius / 6378
          ]
        }
      }
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
          { "attendees.maximum": { $exists: false } }
        ]
      } else {
        filterQuery["attendees.maximum"] = 1;
      }
    }

    if (search) {
      filterQuery.$or = [
        { title: new RegExp(search, `ig`) },
        { description: new RegExp(search, `ig`) }
      ]
    }


    console.log({ filterQuery })
    let filteredEvents = await Event.find(
      filterQuery,
      {},
      { sort: { startAt: 1 }, skip: page * 2, limit: 2 }
    )
      .populate({
        path: `creator`,
        select: { password: 0, email: 0, __v: 0 }
      });

    // an array of promises when resolved becomes a nested array where every sub-array has all the approved attendees for the event with the same index in filteredEvents
    const allEventsAttendeesPromises = []

    filteredEvents.map(evnt => {
      allEventsAttendeesPromises.push(AttendanceRequest.find({ event: evnt.id }, { status: `approved` }));
    });


    const allEventsApprovedAttendees = await Promise.all(allEventsAttendeesPromises);

    filteredEvents.forEach((evnt, i) => {
      evnt.attendees.approved = allEventsApprovedAttendees[i];
    });

    res.status(200).json({ city, events: filteredEvents });
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