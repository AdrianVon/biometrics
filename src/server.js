require('dotenv').config();
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const crypto = require('crypto');

const app = express();
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../public')));

// OAuth login route
app.get('/oauth/login', (req, res) => {
const redirect = `https://api.whoop.com/oauth/oauth2/auth?client_id=${process.env.WHOOP_CLIENT_ID}&redirect_uri=${process.env.WHOOP_REDIRECT_URI}&response_type=code&scope=read:recovery`;  res.redirect(redirect);
});


// OAuth callback (to be expanded)
app.get('/oauth/callback', (req, res) => {
  const code = req.query.code;
  res.send("OAuth callback received. Code: " + code);
});

// WHOOP webhook receiver
app.post('/webhook/whoop', (req, res) => {
  const signature = req.headers['x-whoop-signature'];
  const hmac = crypto.createHmac('sha256', process.env.WHOOP_WEBHOOK_SECRET);
  const digest = hmac.update(JSON.stringify(req.body)).digest('hex');

  if (digest !== signature) {
    return res.status(401).send('Invalid signature');
  }

  console.log("Received WHOOP webhook:", req.body);
  res.sendStatus(200);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});