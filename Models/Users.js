const mongoose = require("mongoose");

const defaultAbouts = [
  "I love discovering new destinations and sharing my space with fellow travelers. Hosting gives me the chance to meet amazing people and make every stay feel special.",
  "Traveling has always been my passion, and hosting lets me bring that passion home. I enjoy connecting with guests, learning their stories, and helping them find the best experiences.",
  "For me, every journey is about people and places. I host because I believe in warm welcomes, meaningful connections, and making guests feel at home wherever they go.",
  "Exploring cultures, meeting new friends, and creating memories—that’s what inspires me. Hosting allows me to share not just a place, but a piece of my journey with every guest.",
];

const userSchema = new mongoose.Schema({
  profilePic: {
    type: String,
  },
  fullName: { type: String, required: true },
  phone: { type: Number, unique: true, sparse: true },
  email: { type: String, required: true, unique: true },
  address: { type: String },
  password: { type: String, minLength: 8 },
  aboutMe: {
    type: String,
    default: function () {
      return defaultAbouts[Math.floor(Math.random() * defaultAbouts.length)];
    },
  },
  totalReviews: { type: Number, default: 0 },
  avgRating: { type: Number, default: 0 },
  badges: [{ type: mongoose.Schema.Types.ObjectId, ref: "Badge" }],
  bookings: [{ type: mongoose.Schema.Types.ObjectId, ref: "Booking" }],
  hosting: [{ type: mongoose.Schema.Types.ObjectId, ref: "Property" }],
  googleId: { type: String, unique: true, sparse: true },
  likedProperties: [{ type: mongoose.Schema.Types.ObjectId, ref: "Property" }],
});

const User = mongoose.model("User", userSchema);
module.exports = User;
