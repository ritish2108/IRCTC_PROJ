const express = require("express");
const router = express.Router();

const {
  getAvailability,
  addTrain,
  bookingSeat,
  booking,
} = require("../controllers/Trains");

router.post("/bookSeat", bookingSeat);
router.get("/bookingInfo/:id", booking);
// router.post("/login", login);

module.exports = router;
