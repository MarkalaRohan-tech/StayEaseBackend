const { google } = require("googleapis");
require('dotenv').config();

const client_id = process.env.GOOGLE_CLIENT_ID;
const client_secret = process.env.GOOGLE_CLIENT_SECRET;

exports.oauth2Client = new google.auth.OAuth2(
  client_id,
  client_secret,
  'postmessage'
);