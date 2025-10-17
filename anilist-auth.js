import axios from "axios";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config();

const TOKEN_FILE = "tokens.json";

async function getTokens(authCode) {
  const res = await axios.post("https://anilist.co/api/v2/oauth/token", {
    grant_type: "authorization_code",
    client_id: process.env.CLIENT_ID,
    client_secret: process.env.CLIENT_SECRET,
    redirect_uri: process.env.REDIRECT_URI,
    code: authCode,
  });
  fs.writeFileSync(TOKEN_FILE, JSON.stringify(res.data, null, 2));
  console.log("✅ Tokens saved:", res.data);
}

async function refreshTokens(refreshToken) {
  const res = await axios.post("https://anilist.co/api/v2/oauth/token", {
    grant_type: "refresh_token",
    client_id: process.env.CLIENT_ID,
    client_secret: process.env.CLIENT_SECRET,
    refresh_token: refreshToken,
  });
  fs.writeFileSync(TOKEN_FILE, JSON.stringify(res.data, null, 2));
  console.log("🔄 Token refreshed:", res.data);
}

async function showAuthUrl() {
  console.log("➡️ Ouvre ce lien dans ton navigateur :");
  console.log(
    `https://anilist.co/api/v2/oauth/authorize?client_id=${process.env.CLIENT_ID}&redirect_uri=${encodeURIComponent(
      process.env.REDIRECT_URI,
    )}&response_type=code`,
  );
  console.log(
    "\nColle ensuite le code que tu récupères dans l'URL en lançant : node anilist-auth.js <CODE>",
  );
}

async function main() {
  if (process.argv[2]) {
    if (process.argv[2] === "refresh") {
      if (!fs.existsSync(TOKEN_FILE)) {
        console.error(
          "❌ Pas de tokens.json trouvé. Lance d'abord avec <CODE>.",
        );
        return;
      }
      const tokens = JSON.parse(fs.readFileSync(TOKEN_FILE, "utf-8"));
      await refreshTokens(tokens.refresh_token);
    } else {
      await getTokens(process.argv[2]);
    }
  } else {
    if (!fs.existsSync(TOKEN_FILE)) {
      await showAuthUrl();
    } else {
      const tokens = JSON.parse(fs.readFileSync(TOKEN_FILE, "utf-8"));
      console.log("✅ Tokens actuels :", tokens);
    }
  }
}

main().catch(console.error);
