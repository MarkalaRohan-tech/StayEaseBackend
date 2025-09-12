const mongoose = require("mongoose");

const badgeSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
    },
    level: {
      type: Number,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    icon: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Badge", badgeSchema);
