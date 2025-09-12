const express = require("express");
const router = express.Router();
const User = require("../Models/Users");
const { createEmailTemplate } = require("../Services/emailTemplate");
const { sendEmail } = require("../Services/sendEmail");

const Booking = require("../Models/Booking");

// GET /api/bookings/:placeId
router.get("/:placeId", async (req, res) => {
  try {
    const bookings = await Booking.find({ placeId: req.params.placeId });

    const bookedDates = bookings.map(b => ({
      startDate: b.startDate,
      endDate: b.endDate,
    }));

    res.json(bookedDates);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// POST /api/bookings
router.post("/", async (req, res) => {
  try {
    const { placeId, userId, startDate, endDate, paymentId, amount } = req.body;

    // Check overlap
    const existing = await Booking.findOne({
      placeId,
      $or: [{ startDate: { $lte: endDate }, endDate: { $gte: startDate } }],
    });

    if (existing) {
      return res
        .status(400)
        .json({ message: "Selected dates are not available" });
    }

    // Save new booking
    const newBooking = new Booking({
      placeId,
      userId,
      startDate,
      endDate,
      paymentId,
      amount,
    });

    const savedBooking = await newBooking.save();

    // Push booking to user
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $push: { bookings: savedBooking._id } },
      { new: true }
    ).lean();

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Send booking confirmation email
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

    res.status(201).json(savedBooking);
  } catch (err) {
    console.error("Booking error:", err);
    res.status(500).json({ error: err.message });
  }
});




module.exports = router;