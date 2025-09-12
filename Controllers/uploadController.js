const  AWS  = require("aws-sdk");
require("dotenv").config();
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

const getPresignedUrl = async (req, res) => {
  try {
    const fileName = req.query.fileName;
    const fileType = req.query.fileType;

    if (!fileName || !fileType) {
      return res.status(400).json({ error: "Missing fileName or fileType" });
    }

    const params = {
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: `HouseImg/${Date.now()}_${fileName}`,
      ContentType: fileType,
      Expires: 60 * 5,
    };

    const uploadUrl = await s3.getSignedUrlPromise("putObject", params);

    res.json({
      uploadUrl,
      fileUrl: `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${params.Key}`,
    });
  } catch (err) {
    console.error("Error generating signed URL", err);
    res.status(500).json({ error: "Could not generate signed URL" });
  }
};

const getProfilePresignedUrl = async (req, res) => {
  try {
    const fileName = req.query.fileName;
    const fileType = req.query.fileType;

    if (!fileName || !fileType) {
      return res.status(400).json({ error: "Missing fileName or fileType" });
    }

    const params = {
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: `profile/${Date.now()}_${fileName}`,
      ContentType: fileType,
      Expires: 60 * 5,
    };

    const uploadUrl = await s3.getSignedUrlPromise("putObject", params);

    res.json({
      uploadUrl,
      fileUrl: `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${params.Key}`,
    });
  } catch (err) {
    console.error("Error generating signed URL", err);
    res.status(500).json({ error: "Could not generate signed URL" });
  }
};

module.exports = {
  getPresignedUrl,
  getProfilePresignedUrl
};
