  import express from "express";
  import axios from "axios";
  import dotenv from "dotenv";

  dotenv.config();

  const app = express();
  const PORT = process.env.PORT || 3000;

  app.get("/callback", async (req, res) => {
    const { code, state } = req.query;
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

      let extensionId, browserType;
      if (state) {
        try {
          const stateData = JSON.parse(Buffer.from(state, 'base64').toString('utf-8'));
          extensionId = stateData.extensionId;
          browserType = stateData.browser;
          console.log('State decoded:', { extensionId, browserType });
        } catch (e) {
          console.error("Erreur lors du décodage du state:", e);
        }
      }

      let redirectUrl;
      if (browserType === 'firefox' && extensionId) {
        redirectUrl = `moz-extension://${extensionId}/ui/auth-success.html#token=${tokens.access_token}`;
      } else if (extensionId) {
        redirectUrl = `chrome-extension://${extensionId}/ui/auth-success.html#token=${tokens.access_token}`;
      } else {
        const CHROME_EXTENSION_ID = "lfenfhdfohiphnoookkcidjneojppldh";
        redirectUrl = `chrome-extension://${CHROME_EXTENSION_ID}/ui/auth-success.html#token=${tokens.access_token}`;
      }

      console.log(`Redirecting to: ${redirectUrl}`);
      res.redirect(redirectUrl);
    } catch (err) {
      console.error(err.response?.data || err.message);
      res.status(500).send("Erreur lors de l'échange du token");
    }
  });

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
