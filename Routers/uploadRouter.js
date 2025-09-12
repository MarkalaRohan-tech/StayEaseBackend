const express = require("express");
const {getPresignedUrl,getProfilePresignedUrl} = require("../Controllers/uploadController");
const router = express.Router();

router
    .get("/get-presigned-url", getPresignedUrl)
    .get("/get-profile-presigned-url", getProfilePresignedUrl);


module.exports = router;