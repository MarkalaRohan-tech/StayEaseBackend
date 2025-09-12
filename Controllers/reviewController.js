const Review = require("../Models/Review");
const User = require("../Models/Users");
const {Property} = require("../Models/PropertyData");
const { createEmailTemplate } = require("../Services/emailTemplate");
const { sendEmail } = require("../Services/sendEmail");

const postComment = async (req, res) => {
  const { property, user, rating, interactionType, comment, name, host } =
    req.body;

  if (!property || !user || !comment || !name || !host) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const newComment = await Review.create({
      name,
      property,
      user,
      rating,
      interactionType,
      comment,
      host,
    });

    const hostData = await User.findById(host, { email: 1, fullName: 1 });
    console.log(hostData);
    const propertyData = await Property.findById(property, { title: 1 });
    console.log(propertyData);

    if (hostData && propertyData) {
      const emailContent = `
        <div class="message">
            📝 You have received a new review for your property: <span class="highlight">${propertyData.title}</span>
        </div>
        <div class="message">
            Check out what your guests are saying and continue providing excellent hospitality!
        </div>
      `;

      const htmlTemplate = createEmailTemplate(
        hostData.fullName,
        "New Review Received",
        emailContent,
        "View Review",
        "https://stayease.com/dashboard/reviews",
        propertyData.title
      );

      await sendEmail(
        hostData.email,
        "Received a review for your property",
        htmlTemplate
      );
    }

    return res
      .status(201)
      .json({ message: "Comment added successfully", data: newComment });
  } catch (error) {
    console.error("Error adding comment:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};


const getComments = async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ message: "Property ID is required" });
  }

  try {
    const comments = await Review.find({ property: id });
    return res.status(200).json({ message: "Comments fetched successfully", data: comments });
  } catch (error) {
    console.error("Error fetching comments:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  postComment,
  getComments
};
