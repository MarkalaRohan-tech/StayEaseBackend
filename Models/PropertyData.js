const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const basePropertySchema = new Schema(
  {
        rentType: {
      type: String,
      required: true,
      enum: ["local", "tour"],
    },
    title: { type: String, required: true },
    imageUrls: { type: [String], required: true },
    description: { type: String, required: true },
    keyword: { type: [String], default: [] },

    location: {
      fullAddress: { type: String, required: true },
      area: String,
      locality: String,
      city: String,
      state: String,
      pincode: String,
      country: String,
    },

    price: { type: Number, required: true, min: 0 },
    bedrooms: { type: Number, default: 1, min: 0 },
    bathrooms: { type: Number, default: 1, min: 0 },
    furnished: { type: Boolean, default: false },
    amenities: { type: [String], default: [] },
    propertyType: {
      type: [String],
      required: true,
      default: [],
    },
    size: { type: String },

    ownerContact: {
      name: String,
      phone: String,
      email: String,
    },

    rating: {
      type: Number,
      default: 5,
      min: 0,
      max: 5,
    },
    petFriendly: { type: Boolean, default: false },
    floor: { type: Number, min: 0 },
    totalFloors: { type: Number, min: 0 },

    hostedBy: { type: String, required: true },
  },
  { timestamps: true } // automatically adds createdAt and updatedAt
);

const Property = mongoose.model("Property", basePropertySchema);

module.exports = { Property };
