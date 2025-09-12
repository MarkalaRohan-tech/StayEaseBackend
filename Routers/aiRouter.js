// server.js or routes/api.js
const express = require("express");
const axios = require("axios");
const router = express.Router();
const dotenv = require("dotenv");
dotenv.config();


router.post("/", async (req, res) => {
  try {
    const { prompt } = req.body;

    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "deepseek/deepseek-chat-v3.1:free",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 150,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error("AI API Error:", error.response?.data || error.message);
    res
      .status(500)
      .json({ error: error.response?.data || "AI request failed" });
  }
});

module.exports = router;


module.exports = router;
