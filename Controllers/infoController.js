const User = require("../Models/Users");
const Booking = require("../Models/Booking");

const getBookingInfoById = async (req, res) => {
  const { id } = req.params;

  try {
      const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const bookings = await Booking.find({
      _id: { $in: user.bookings || [] },
    }).populate("placeId", "title");

    const finalData = bookings.map((b) => ({
      booking_id: b._id,
      payment_id: b.paymentId,
      property_title: b.placeId ? b.placeId.title : "Property not found",
      amount: b.amount,
      createdAt: b.createdAt,
    }));


    res.status(200).json(finalData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching bookings", error });
  }
};

const getAchievementsByUserId = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findById(id).populate({
      path: "badges",
      select: "name icon description type level",
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const achievements = user.badges || [];

    res.status(200).json(achievements);
  } catch (error) {
    console.error("Error fetching achievements:", error);
    res.status(500).json({ message: "Error fetching achievements", error });
  }
};


const getHostingInfoById = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findById(id).populate({
      path: "hosting",
      select: "imageUrls title price createdAt",
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const hostings = user.hosting || [];
    res.status(200).json(hostings);
  } catch (error) {
    console.error("Error fetching hostings:", error);
    res.status(500).json({ message: "Error fetching hostings", error });
  }
};


module.exports = {
  getBookingInfoById,
  getAchievementsByUserId,
  getHostingInfoById
};
