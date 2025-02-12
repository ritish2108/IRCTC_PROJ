const express = require("express");
const router = express.Router();
const roleAuth = require("../middleware/roleAuth");
const apiKeyAuth = require("../middleware/apiKeyAuth");
const {
  availabilityByRoute,
  bookingSeatByRoute,
} = require("../controllers/Trains");

router.get("/getAvailabilityByRoute", availabilityByRoute);
router.post("/bookSeatsByRoute", bookingSeatByRoute);
// router.post("/bookSeat", bookingSeat);
// router.post("/login", login);

module.exports = router;
