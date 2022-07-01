const router = require("express").Router();
const Event = require("../models/Event.model");


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