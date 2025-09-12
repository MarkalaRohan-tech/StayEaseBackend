const User = require("../Models/Users");
const Badge = require("../Models/Badges");

exports.allocateBadgesController = async (req, res) => {
  try {
      const { id } = req.params;
    let user = await User.findById(id).populate("badges");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

      const allBadges = await Badge.find();
    const earnedBadges = [];

    for (const badge of allBadges) {
      let qualifies = false;

      // 🎖 Hosting badges
      if (badge.type === "hosting") {
        if (badge.level === 1 && user.hosting.length >= 5) qualifies = true;
        if (badge.level === 2 && user.hosting.length >= 20) qualifies = true;
        if (badge.level === 3 && user.hosting.length >= 50) qualifies = true;
      }

      // 🎖 Booking badges
      if (badge.type === "booking") {
        if (badge.level === 1 && user.bookings.length >= 3) qualifies = true;
        if (badge.level === 2 && user.bookings.length >= 10) qualifies = true;
        if (badge.level === 3 && user.bookings.length >= 30) qualifies = true;
      }

      // 🎖 Rating badges
      if (badge.type === "rating") {
        if (
          badge.level === 1 &&
          user.avgRating >= 4.0 &&
          user.totalReviews >= 5
        )
          qualifies = true;
        if (
          badge.level === 2 &&
          user.avgRating >= 4.3 &&
          user.totalReviews >= 20
        )
          qualifies = true;
        if (
          badge.level === 3 &&
          user.avgRating >= 4.7 &&
          user.totalReviews >= 50
        )
          qualifies = true;
      }

      if (qualifies && !user.badges.some((b) => b._id.equals(badge._id))) {
        earnedBadges.push(badge._id);
      }
      }
      if (earnedBadges.length > 0) {
      user.badges.push(...earnedBadges);
      await user.save();
    }

    user = await User.findById(id).populate("badges");
    return res.json(user);
  } catch (error) {
    console.error("Error allocating badges:", error);
    res.status(500).json({ message: "Server error" });
  }
};
