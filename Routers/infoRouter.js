const express = require("express");
const {
  getBookingInfoById,
  getAchievementsByUserId,
  getHostingInfoById
} = require("../Controllers/infoController");

const router = express.Router();

router
  .get("/booking/:id", getBookingInfoById)
  .get("/achievements/:id", getAchievementsByUserId)
  .get("/hosting/:id", getHostingInfoById);

module.exports = router;
