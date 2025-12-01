const { google } = require("googleapis");
const readline = require("readline");

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

// Desktop apps MUST use localhost redirect URI
const REDIRECT_URI = "http://localhost";

const oauth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);

// REQUIRED SCOPES for Like + Watch History
const SCOPES = [
  "https://www.googleapis.com/auth/youtube.force-ssl",
  "https://www.googleapis.com/auth/youtube.readonly"
];

// Must include "prompt: consent" to receive a refresh token
const authUrl = oauth2Client.generateAuthUrl({
  access_type: "offline",
  prompt: "consent",
  scope: SCOPES,
});

console.log("\n🔗 Authorize this app by visiting this URL:\n");
console.log(authUrl);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question("\nPaste the code you received here: ", async (code) => {
  try {
    const { tokens } = await oauth2Client.getToken(code);

    console.log("\n===== TOKEN RESULTS =====");
    console.log("👉 ACCESS TOKEN:\n", tokens.access_token);
    console.log("\n👉 REFRESH TOKEN (SAVE THIS IN .env):\n", tokens.refresh_token);
    console.log("\n=========================\n");

    rl.close();
  } catch (error) {
    console.error("❌ Error retrieving OAuth token:", error);
    rl.close();
  }
});
