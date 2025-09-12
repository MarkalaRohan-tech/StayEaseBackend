const express = require("express");
const { connectToDB } = require("./Configs/connectToDB");
const userRouter = require("./Routers/userAuthRouter");
const uploadRouter = require("./Routers/uploadRouter");
const propertyRouter = require("./Routers/propertyRouter");
const reviewRouter = require("./Routers/reviewRouter");
const infoRouter = require("./Routers/infoRouter");
const aiRouter = require("./Routers/aiRouter");
const tourBookingRouter = require("./Routers/TourBooking");
const app = express();
const cors = require("cors");
const cookieParser = require("cookie-parser");
const Razorpay = require("razorpay");
const crypto = require("crypto")
const Booking = require("./Models/Booking");
require("dotenv").config();

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true, 
  })
);
app.use("/images", express.static("public"));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


connectToDB(process.env.MONGODB_URL)
    .then(() => {
        console.log("Connected to MongoDB Successfully...");
    })
    .catch((error) => {
        console.error("MongoDB connection error:", error);
    });

app.get("/api", (req, res) => {
  res.send("Hello World!");
});

app.use("/api/user", userRouter);

app.use("/api/upload", uploadRouter);

app.use("/api/property", propertyRouter);

app.use("/api/review", reviewRouter);

app.use("/api/fetch", infoRouter);

app.use("/api/ai", aiRouter);

app.use("/api/bookings", tourBookingRouter);

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

app.post("/api/payment/order", async (req, res) => {
  const { amount, currency, receipt } = req.body;
  try {
    const order = await razorpay.orders.create({
      amount : amount *100,
      currency: currency||"INR",
      receipt: receipt || "receipt#1",
    });
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: "Failed to create order" });
  }
});

app.post("/api/payment/verify", (req, res) => {
  const { paymentId, orderId, signature } = req.body;
  const generatedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");

  if (generatedSignature === signature) {
    res.json({ status: "success", paymentId: paymentId });
  } else {
    res.status(400).json({ status: "failed" });
  }
});

app.get("/api/geocode", async (req, res) => {
  const { address } = req.query;
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        address
      )}`,
      { headers: { "User-Agent": "your-app-name" } } 
    );
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch coordinates" });
  }
});

app.post("/api/payment/save", async (req, res) => {
  console.log("Payment data received:", req.body);
  const { userId, placeId, paymentId, amount } = req.body;
  try {
    const booking = new Booking({
      userId,
      placeId,
      paymentId,
      amount,
      startDate: new Date(),
      endDate: new Date(),
    });
    await booking.save();
    res.json({ status: "success", data: booking });
  } catch (error) {
    res.status(500).json({ status: "failed", error: error.message });
  }
});

app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});
