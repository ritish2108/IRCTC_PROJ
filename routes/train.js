const express = require("express");
const router = express.Router();
const roleAuth = require("../middleware/roleAuth");
const apiKeyAuth = require("../middleware/apiKeyAuth");
const {
  getAvailability,
  addTrain,
  bookingSeat,
} = require("../controllers/Trains");

router.get("/getAvailability", getAvailability);
router.post("/addTrain", roleAuth, apiKeyAuth, addTrain);
// router.post("/bookSeat", bookingSeat);
// router.post("/login", login);

module.exports = router;
