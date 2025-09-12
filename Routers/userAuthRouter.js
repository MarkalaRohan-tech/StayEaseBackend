const express = require("express");
const { verifyToken } = require("../Middlewares/verifyJWT");
const {
  getUsers,
  getUserById,
  getActivityData,
} = require("../Controllers/userAuthController");
const { allocateBadgesController } = require("../Controllers/achievementsController");
const validate = require("../Middlewares/userAuthValidate");
const { loginSchema, registerSchema } = require("../Services/authSchemas");
const User = require("../Models/Users");
const Review = require("../Models/Review");
const Booking = require("../Models/Booking");
const router = express.Router();

const { sendEmail } = require("../Services/sendEmail");
const { createEmailTemplate } = require("../Services/emailTemplate");

const {
  handleUserSignup,
  handleUserLogin,
  handleGoogleAuth
} = require("../Controllers/userAuthController");

router
  .post("/signup", validate(registerSchema), handleUserSignup)
  .post("/login", validate(loginSchema), handleUserLogin)
  .post("/googleAuth", handleGoogleAuth)
  .get("/account", validate(loginSchema), handleUserLogin)
  .put("/update", async (req, res) => {
  const { userId, paymentId } = req.body;
  console.log("Booking Details:", paymentId, userId);

  try {
    // Find booking by paymentId
    const booking = await Booking.findOne({ paymentId });
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    const bookingId = booking._id;
    console.log("Booking ID:", bookingId);

    // Update user with new booking
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $push: { bookings: bookingId } },
      { new: true }
    ).lean(); // .lean() returns a plain object

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Prepare and send booking confirmation email
    const emailContent = `
      <div class="message">
          🏨 Congratulations! You have successfully booked a property through <span class="highlight">StayEase</span>.
      </div>
      <div class="message">
          Your booking details have been sent to the host, and you'll receive confirmation shortly.
      </div>
      <div class="message">
          Have an amazing stay! 🌟
      </div>
    `;

    const htmlTemplate = createEmailTemplate(
      updatedUser.fullName,
      "Booking Confirmed ✅",
      emailContent,
      "View Booking Details",
      "https://stayease.com/dashboard/bookings"
    );

    await sendEmail(
      updatedUser.email,
      "Property booked successfully ✅",
      htmlTemplate
    );

    res
      .status(200)
      .json({ message: "User updated successfully", user: updatedUser });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ message: "Error updating user", error: error.message });
  }
})
  .put("/updateHosting", async (req, res) => {
    const { userId, placeId } = req.body;
    try {
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { $push: { hosting: placeId } },
        { new: true }
      );
      res
        .status(200)
        .json({ message: "User updated successfully", user: updatedUser });
    } catch (error) {
      res.status(500).json({ message: "Error updating user", error });
    }
  })
  .put("/update-profile", async (req, res) => {
    try {
      const updatedUser = await User.findByIdAndUpdate(req.body._id, req.body, {
        new: true,
      });

      res.status(200).json({
        message: "Profile updated successfully",
        user: updatedUser,
      });
    } catch (error) {
      res.status(500).json({ message: "Error updating profile", error });
    }
  })
  .post("/:id/allocate-badges", allocateBadgesController);


router
  .get("/", verifyToken, getUsers)
  .get("/:id", verifyToken, getUserById)
  .get("/:id/reviews", async (req, res) => {
    const { id } = req.params;

    try {
      const reviews = await Review.find({ host: id });

      const avgRating =
        reviews.length > 0
          ? Number(
              reviews.reduce((acc, review) => acc + review.rating, 0) /
                reviews.length
            ).toFixed(1)
          : 0;

      // Update user stats
      await User.findByIdAndUpdate(
        id,
        { totalReviews: reviews.length, avgRating: avgRating },
        { new: true }
      );

      res.status(200).json({
        totalReviews: reviews.length,
        avgRating: avgRating, // ensures it's a number, not a string
        reviews,
      });
    } catch (error) {
      res.status(500).json({ message: "Error fetching reviews", error });
    }
  })
  .get("/:userId/activity", getActivityData)
  
router.post("/:userId/like/:propertyId", async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { $addToSet: { likedProperties: req.params.propertyId } },
      { new: true }
    ).populate("likedProperties");
    res.json(user.likedProperties);
  } catch (err) {
    res.status(500).json({ error: "Failed to like property" });
  }
});

router.delete("/:userId/like/:propertyId", async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { $pull: { likedProperties: req.params.propertyId } },
      { new: true }
    ).populate("likedProperties");
    res.json(user.likedProperties);
  } catch (err) {
    res.status(500).json({ error: "Failed to unlike property" });
  }
});


router.get("/:userId/likes", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select(
      "likedProperties"
    );
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Convert ObjectIds to strings
    const likedIds = user.likedProperties.map((id) => String(id));
    res.json(likedIds);
  } catch (err) {
    console.error("Error fetching likes:", err);
    res.status(500).json({ error: "Failed to fetch likes" });
  }
});


module.exports = router;