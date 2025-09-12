const { Property } = require("../Models/PropertyData");
const { sendEmail } = require("../Services/sendEmail");
const { createEmailTemplate } = require("../Services/emailTemplate");
const User = require("../Models/Users"); // import User model

const createNewListing = async (req, res) => {
  try {
    const propertyData = req.body;

    // ✅ Get userId from req.body (frontend should send it)
    const { userId } = req.body;

    // Validate required fields
    const requiredFields = [
      "title",
      "imageUrls",
      "description",
      "price",
      "hostedBy",
      "rentType",
    ];

    const missingFields = requiredFields.filter(
      (field) => !propertyData[field]
    );

    if (!propertyData.location?.fullAddress) {
      missingFields.push("location.fullAddress");
    }

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(", ")}`,
      });
    }

    const { rentType, ...propertyFields } = propertyData;

    if (!["local", "tour"].includes(rentType)) {
      return res.status(400).json({
        success: false,
        message: "Invalid rentType. Must be 'local' or 'tour'.",
      });
    }

    const demoProperty = new Property({ ...propertyFields, rentType });
    const savedProperty = await demoProperty.save();

    // ✅ Fetch user from DB
    const user = await User.findById(userId, { fullName: 1, email: 1 });

    // Respond immediately to client
    res.status(201).json({
      success: true,
      message: "Property created successfully",
      data: savedProperty,
    });

    // ✅ Send email asynchronously (won’t block response)
    if (user) {
      const emailContent = `
    <div class="message">
      🏡 Excellent! Your property <span class="highlight">${propertyData.title}</span> has been successfully created and is now live on StayEase.
    </div>
    <div class="message">
      Our community of travelers can now discover and book your amazing space.
    </div>
  `;

      const htmlTemplate = createEmailTemplate(
        user.fullName,
        "Property Listed Successfully ✅",
        emailContent,
        "Manage Property",
        "https://stayease.com/dashboard/properties",
        propertyData.title
      );

      // Run in background
      sendEmail(user.email, "Property created successfully ✅", htmlTemplate)
        .then(() => console.log("✅ Email sent successfully"))
        .catch((err) => console.error("❌ Email sending failed:", err));
    }


    res.status(201).json({
      success: true,
      message: "Property created successfully",
      data: savedProperty,
    });
  } catch (error) {
    console.error("Error creating property:", error);

    if (error.name === "ValidationError") {
      const validationErrors = Object.values(error.errors).map(
        (err) => err.message
      );
      return res.status(400).json({
        success: false,
        message: `Validation error: ${validationErrors.join(", ")}`,
      });
    }

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Property with this data already exists",
      });
    }

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};



const getAllTourProperties = async (req, res) => {
  try {
    const { area, propertyType, minPrice, maxPrice, amenities } = req.query;

    const query = { rentType: "tour" };

    if (area) query["location.area"] = area;
    if (propertyType) query.propertyType = propertyType;

    if (minPrice || maxPrice) query.price = {};
    if (minPrice) query.price.$gte = Number(minPrice);
    if (maxPrice) query.price.$lte = Number(maxPrice);

    if (amenities) query.amenities = { $all: amenities.split(",") };

    const properties = await Property.find(query).select(
      "_id imageUrls title location amenities price rating propertyType"
    );

    res.status(200).json({ success: true, data: properties });
  } catch (error) {
    console.error("Error fetching Tour properties:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const getAllLocalProperties = async (req, res) => {
  try {
    const { area, propertyType, minPrice, maxPrice, amenities } = req.query;

    const query = { rentType: "local" };

    if (area) query["location.area"] = area;
    if (propertyType) query.propertyType = propertyType;

    if (minPrice || maxPrice) query.price = {};
    if (minPrice) query.price.$gte = Number(minPrice);
    if (maxPrice) query.price.$lte = Number(maxPrice);

    if (amenities) query.amenities = { $all: amenities.split(",") };

    const properties = await Property.find(query).select(
      "_id imageUrls title location amenities price rating propertyType"
    );

    res.status(200).json({ success: true, data: properties });
  } catch (error) {
    console.error("Error fetching Local properties:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};


const getPropertyDetails = async (req, res) => {
  try {
    const { id } = req.params;

    let property = await Property.findById(id);

    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found",
      });
    }

    res.status(200).json({
      success: true,
      data: property,
    });
  } catch (error) {
    console.error("Error fetching property:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const searchLocalProperties = async (req, res) => {
  try {
    const { term } = req.query;

    if (!term) {
      return res.status(400).json({
        success: false,
        message: "Search term is required",
      });
    }

    const propertyData = await Property.find({
      title: { $regex: term, $options: "i" },
      rentType: "local",
    }).select("_id imageUrls title location amenities price rating");

    res.status(200).json({
      success: true,
      data: [...propertyData],
    });
  } catch (error) {
    console.error("Error searching properties:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


const searchTourProperties = async (req, res) => {
  try {
    const { term } = req.query;

    if (!term) {
      return res.status(400).json({
        success: false,
        message: "Search term is required",
      });
    }

    const propertyData = await Property.find({
      title: { $regex: term, $options: "i" },
      rentType: "tour",
    }).select("_id imageUrls title location amenities price rating");

    res.status(200).json({
      success: true,
      data: [...propertyData],
    });
  } catch (error) {
    console.error("Error searching properties:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const getRecommendedProperties = async (req, res) => {
  try {
    const { id } = req.params;

    // Step 1: Find the base property
    const baseProperty = await Property.findById(id);

    if (!baseProperty) {
      return res.status(404).json({
        success: false,
        message: "Base property not found",
      });
    }

    const rentType = baseProperty.rentType;

    // Step 2: Ensure amenities/keywords are arrays
    const amenitiesArr = Array.isArray(baseProperty.amenities)
      ? baseProperty.amenities
      : [];
    const keywordArr = Array.isArray(baseProperty.keyword)
      ? baseProperty.keyword
      : [];

    // Step 3: Aggregate to find similar properties
    const recommended = await Property.aggregate([
      {
        $match: {
          _id: { $ne: baseProperty._id },
          rentType: rentType,
        },
      },
      {
        $addFields: {
          commonAmenities: {
            $size: { $setIntersection: ["$amenities", amenitiesArr] },
          },
          commonKeywords: {
            $size: { $setIntersection: ["$keyword", keywordArr] },
          },
        },
      },
      {
        $addFields: {
          similarityScore: { $add: ["$commonAmenities", "$commonKeywords"] },
        },
      },
      { $match: { similarityScore: { $gt: 0 } } },
      { $sort: { similarityScore: -1, rating: -1 } },
      {
        $project: {
          _id: 1,
          title: 1,
          imageUrls: 1,
          location: 1,
          price: 1,
          amenities: 1,
        },
      },
      { $limit: 5 },
    ]);
    console.log(recommended);
    res.status(200).json({
      success: true,
      data: recommended,
    });
  } catch (error) {
    console.error("Error fetching recommendations:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};



module.exports = {
  createNewListing,
  getAllLocalProperties,
  getAllTourProperties,
  getPropertyDetails,
  searchLocalProperties,
  searchTourProperties,
  getRecommendedProperties
};
