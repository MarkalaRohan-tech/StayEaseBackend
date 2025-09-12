const bcrypt = require("bcrypt");
const User = require("../Models/Users");
const {Property} = require("../Models/PropertyData");
const Booking = require("../Models/Booking");
const jwt = require("jsonwebtoken");
const { oauth2Client } = require("../Configs/googleAuthConfig");
const mongoose = require("mongoose");
const axios = require("axios");
const { createEmailTemplate } = require("../Services/emailTemplate");
const { sendEmail } = require("../Services/sendEmail");

const getUsers = async (req, res) => {
  try {
    const users = await User.find().select("_id fullName email phone");
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

const handleUserSignup = async (req, res) => {
  try {
    const { profilePic, fullName, phone, email, address, password } = req.body;

    const existingUser = await User.findOne({ $or:[{ email }, { phone }] });
    if (existingUser) {
      return res.status(400).json({ message: "Email or phone number already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      profilePic,
      fullName,
      phone,
      email,
      address,
      password: hashedPassword,
    });

    await user.save();

    const userResponse = {
      _id: user._id,
      fullName: user.fullName,
    };

    const sendEmailToUser = async () => {
      const emailContent = `
    <div class="message">
        🎉 Welcome to <span class="highlight">StayEase</span>! Your account has been successfully created.
    </div>
    <div class="message">
        You can now start booking amazing properties and hosting your own spaces with our community of travelers.
    </div>
  `;

      const htmlTemplate = createEmailTemplate(
        user.fullName,
        "Welcome to StayEase ✅",
        emailContent,
        "Explore Properties",
        "https://stayease.com/properties"
      );

      await sendEmail(user.email, "Registered successfully ✅", htmlTemplate);
    };

    sendEmailToUser();

    res.status(201).json({
      message: "User registered successfully",
      user: userResponse,
    });
  } catch (error) {
    console.error("Error occurred while signing up:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const handleUserLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const userResponse = {
      _id: user._id,
      fullName: user.fullName,
    };
    const token = jwt.sign({ fullName: user.fullName, email: user.email }, process.env.JWT_SECRET, { expiresIn: "1h" });

      res.cookie("token", token, {
        httpOnly: true,
        sameSite: "Strict",
      });
    res.status(200).json({
      message: "User logged in successfully",
      user: userResponse,
      token: token,
    });
  } catch (error) {
    console.error("Error occurred while logging in:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const handleGoogleAuth = async (req, res) => {
  const { code } = req.body;

  try {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    const userInfoResponse = await axios.get("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: {
        Authorization: `Bearer ${tokens.access_token}`,
      },
    });

    const userInfo = userInfoResponse.data;

    if (!userInfo) {
      return res.status(401).json({ message: "Invalid Google token" });
    }

    // Check if the user already exists
    let user = await User.findOne({ email: userInfo.email });
    if (!user) {
      // If not, create a new user
      user = new User({
        fullName: userInfo.name,
        email: userInfo.email,
        profilePic: userInfo.picture,
      });
      await user.save();
    }

    // Generate a JWT token
    const token = jwt.sign({ id: user._id, fullName: user.fullName, email: user.email }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "Strict",
    });

    res.status(200).json({
      message: "Google authentication successful",
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        profilePic: user.profilePic,
      },
      token,
    });
  } catch (error) {
    console.error("Error occurred during Google authentication:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getMonthlyBookings = async (userId) => {
  try {
    const monthlyBookings = await Booking.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: { $month: "$createdAt" },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Convert result into a 12-month array (Jan–Dec)
    const result = Array(12).fill(0);
    monthlyBookings.forEach((b) => {
      result[b._id - 1] = b.count;
    });

    console.log("Monthly Bookings:", result);
    return result;
  } catch (err) {
    console.error("Error fetching monthly bookings:", err);
    return Array(12).fill(0);
  }
};


// Get Monthly Hostings
const getMonthlyHostings = async (userId) => {
  try {
    const monthlyHostings = await Property.aggregate([
      { $match: { hostedBy: userId } }, // hostedBy is a String
      {
        $group: {
          _id: { $month: "$createdAt" },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Convert result into a 12-month array (Jan–Dec)
    const result = Array(12).fill(0);
    monthlyHostings.forEach((h) => {
      result[h._id - 1] = h.count;
    });
    console.log(result)
    return result;
  } catch (err) {
    console.error("Error fetching monthly hostings:", err);
    return Array(12).fill(0);
  }
};


const getActivityData = async (req, res) => {
    try {
      const userId = req.params.userId;
      const bookings = await getMonthlyBookings(userId); 
      const hosting = await getMonthlyHostings(userId);
      console.log("Activity data dejdjcdj dndnsjwnij wj d:", { bookings, hosting });
      res.json({ bookings, hosting });
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch activity" });
    }
  }

module.exports = { handleUserSignup, handleUserLogin, getUsers, handleGoogleAuth, getUserById, getActivityData };
