const express = require("express");
const {
  createNewListing,
  getAllLocalProperties,
  getAllTourProperties,
  getPropertyDetails,
  searchLocalProperties,
  searchTourProperties,
  getRecommendedProperties
} = require("../Controllers/propertyController");

const router = express.Router();

router
  .post("/createNew", createNewListing)
  .get("/getAllLocal", getAllLocalProperties)
  .get("/getAllTour", getAllTourProperties)
  .get("/getDetails/:id", getPropertyDetails)
  .get("/searchLocal", searchLocalProperties)
  .get("/searchTour", searchTourProperties)
  .get("/getRecommended/:id", getRecommendedProperties);

module.exports = router;