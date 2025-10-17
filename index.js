import express from "express";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/callback", async (req, res) => {
  const { code } = req.query;
  if (!code) return res.status(400).send("Missing code parameter");

  try {
    const tokenRes = await axios.post("https://anilist.co/api/v2/oauth/token", {
      grant_type: "authorization_code",
      client_id: process.env.CLIENT_ID,
      client_secret: process.env.CLIENT_SECRET,
      redirect_uri: process.env.REDIRECT_URI,
      code,
    });

    const tokens = tokenRes.data;

    const EXTENSION_ID = "lfenfhdfohiphnoookkcidjneojppldh";

    const redirectUrl = `chrome-extension://${EXTENSION_ID}/ui/auth-success.html#token=${tokens.access_token}`;
    res.redirect(redirectUrl);
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).send("Erreur lors de l'échange du token");
  }
});

app.listen(PORT, () => {
  console.log(`Serveur lancé sur http://localhost:${PORT}`);
});
