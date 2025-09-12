const express = require("express");
const {postComment,getComments} = require("../Controllers/reviewController");
const router = express.Router();

router
    .post("/add", postComment)
    .get("/getComments/:id", getComments)


module.exports = router;