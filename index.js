import express from "express";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

/*
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
        const stateData = JSON.parse(
          Buffer.from(state, "base64").toString("utf-8"),
        );
        extensionId = stateData.extensionId;
        browserType = stateData.browser;
        console.log("State decoded:", { extensionId, browserType });
      } catch (e) {
        console.error("Erreur lors du décodage du state:", e);
      }
    }

    let redirectUrl;
    if (browserType === "firefox" && extensionId) {
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
*/

app.get("/callback", async (req, res) => {
  const { code, state } = req.query;
  if (!code) return res.status(400).send("Missing code parameter");

  try {
    // Décoder les informations de l'extension depuis le state
    let extensionInfo = {
      browserType: "chrome",
      extensionId: "lfenfhdfohiphnoookkcidjneojppldh",
    };

    if (state) {
      try {
        const decodedState = JSON.parse(atob(state));
        extensionInfo = decodedState;
        console.log("State decoded:", decodedState);
      } catch (e) {
        console.warn("Erreur décodage state:", e);
      }
    }

    const tokenRes = await axios.post("https://anilist.co/api/v2/oauth/token", {
      grant_type: "authorization_code",
      client_id: process.env.CLIENT_ID,
      client_secret: process.env.CLIENT_SECRET,
      redirect_uri: process.env.REDIRECT_URI,
      code,
    });

    const tokens = tokenRes.data;
    console.log("tokens : ", tokens);

    // Construire l'URL de redirection selon le navigateur
    let redirectUrl;
    if (extensionInfo.browserType === "firefox") {
      redirectUrl = `moz-extension://${extensionInfo.extensionId}/ui/auth-success.html#token=${tokens.access_token}`;
    } else {
      redirectUrl = `chrome-extension://${extensionInfo.extensionId}/ui/auth-success.html#token=${tokens.access_token}`;
    }

    console.log("Redirecting to:", redirectUrl);

    // Pour Firefox, afficher une page intermédiaire au lieu de rediriger
    if (extensionInfo.browserType === "firefox") {
      res.send(`
          <!DOCTYPE html>
          <html>
          <head>
            <title>Authentification réussie</title>
            <meta charset="UTF-8">
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                text-align: center;
                padding: 50px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                min-height: 100vh;
                margin: 0;
                display: flex;
                align-items: center;
                justify-content: center;
              }
              .container {
                background: white;
                border-radius: 12px;
                padding: 40px;
                box-shadow: 0 20px 40px rgba(0,0,0,0.1);
                max-width: 400px;
              }
              h1 { color: #333; margin-bottom: 20px; }
              p { color: #666; margin-bottom: 30px; line-height: 1.5; }
              button {
                background: #667eea;
                color: white;
                border: none;
                padding: 15px 30px;
                border-radius: 6px;
                font-size: 16px;
                cursor: pointer;
                font-weight: 500;
                transition: background-color 0.2s;
              }
              button:hover { background: #5a67d8; }
              .auto-message {
                margin-top: 20px;
                font-size: 12px;
                color: #999;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>✅ Authentification réussie !</h1>
              <p>Votre compte AniList a été connecté avec succès.</p>
              <p>Cliquez sur le bouton ci-dessous pour finaliser la configuration dans votre extension :</p>
              <button onclick="openExtension()">Ouvrir l'extension</button>
              <div class="auto-message">
                La page se fermera automatiquement après avoir ouvert l'extension.
              </div>
            </div>

            <script>
              const targetUrl = "${redirectUrl}";

              function openExtension() {
                try {
                  // Ouvrir l'extension
                  window.open(targetUrl, '_blank');

                  // Fermer cette page après un court délai
                  setTimeout(() => {
                    window.close();
                  }, 1000);
                } catch (e) {
                  console.error('Erreur ouverture extension:', e);
                  alert('Veuillez copier cette URL dans votre navigateur:\\n' + targetUrl);
                }
              }

              // Message de succès dans la console
              console.log('Token reçu avec succès pour l\\'extension:', "${extensionInfo.extensionId}");
            </script>
          </body>
          </html>
        `);
    } else {
      // Chrome: redirection directe
      res.redirect(redirectUrl);
    }
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).send("Erreur lors de l'échange du token");
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
