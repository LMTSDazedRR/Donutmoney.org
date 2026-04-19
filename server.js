require("dotenv").config();
const express = require("express");
const session = require("express-session");
const axios = require("axios");
const path = require("path");

const app = express();
app.use(express.json());

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true
}));

// Serve frontend
app.use(express.static(path.join(__dirname, "../public")));

// Discord login
app.get("/auth/discord", (req, res) => {
  const redirect = `https://discord.com/oauth2/authorize?client_id=${process.env.DISCORD_CLIENT_ID}&response_type=code&redirect_uri=${encodeURIComponent(process.env.BASE_URL + "/auth/discord/callback")}&scope=identify`;
  res.redirect(redirect);
});

app.get("/auth/discord/callback", async (req, res) => {
  const code = req.query.code;

  const tokenRes = await axios.post("https://discord.com/api/oauth2/token", new URLSearchParams({
    client_id: process.env.DISCORD_CLIENT_ID,
    client_secret: process.env.DISCORD_CLIENT_SECRET,
    grant_type: "authorization_code",
    code,
    redirect_uri: process.env.BASE_URL + "/auth/discord/callback"
  }), {
    headers: { "Content-Type": "application/x-www-form-urlencoded" }
  });

  const userRes = await axios.get("https://discord.com/api/users/@me", {
    headers: { Authorization: `Bearer ${tokenRes.data.access_token}` }
  });

  req.session.user = userRes.data;
  res.redirect("/");
});

// PayPal order (simplified)
app.post("/create-order", (req, res) => {
  const { total } = req.body;
  res.json({ id: "FAKE_ORDER_ID", total });
});

// Ticket creation endpoint
app.post("/order", async (req, res) => {
  const { cart } = req.body;

  if (!req.session.user) return res.status(401).send("Not logged in");

  const createTicket = require("./bot");
  await createTicket(req.session.user, cart);

  res.send("Order processed");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server running on " + PORT));