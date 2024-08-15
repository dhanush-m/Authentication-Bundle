require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const jwt = require('jsonwebtoken');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

app.get('/login', (req, res) => {
  const authUrl = `${process.env.AUTH_URL}?response_type=code&client_id=${process.env.CLIENT_ID}&redirect_uri=${encodeURIComponent(process.env.REDIRECT_URI)}`;
  console.log('Authorization URL:', authUrl);
  res.redirect(authUrl);
});

app.get('/oauth2/callback', async (req, res) => {
  const { code } = req.query;
  try {
    const response = await axios.post(process.env.TOKEN_URL, {
      grant_type: 'authorization_code',
      code,
      client_id: process.env.CLIENT_ID,
      client_secret: process.env.CLIENT_SECRET,
      redirect_uri: process.env.REDIRECT_URI
    });
    
    // Redirect to the frontend with the token
    res.redirect(`${process.env.FRONTEND_URL}/?token=${response.data.access_token}`);
  } catch (error) {
    console.error('Error getting token:', error.response ? error.response.data : error.message);
    res.status(500).send('Authentication failed');
  }
});

app.get('/logout', (req, res) => {
  // Clear any stored tokens or sessions here
  res.redirect('/');
});

app.get('/debug-env', (req, res) => {
  res.json({
    REDIRECT_URI: process.env.REDIRECT_URI,
    AUTH_URL: process.env.AUTH_URL,
    CLIENT_ID: process.env.CLIENT_ID
  });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
