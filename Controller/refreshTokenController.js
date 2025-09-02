require("dotenv").config();
const jwt = require('jsonwebtoken');
const AUTH_TOKEN_CODE = process.env.AUTH_TOKEN_CODE
const REFRESH_TOKEN_CODE = process.env.REFRESH_TOKEN_CODE;
const express = require('express');


exports.handleRefresh = async (req, res) => {
  const refreshToken = req.body.refreshToken;

  // Verify that the refresh token is valid and retrieve the user ID from it
  jwt.verify(refreshToken, REFRESH_TOKEN_CODE, (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: 'Invalid refresh token' });
    }
    const userId = decoded.id;
    // Check if the refresh token is in the database and has not expired
    // This would typically be done using a database query
    const refreshTokens = [
      { userId: 1, refreshToken: 'refresh_token_1', expiry: Date.now() + 30 * 24 * 60 * 60 * 1000 },
      { userId: 2, refreshToken: 'refresh_token_2', expiry: Date.now() + 30 * 24 * 60 * 60 * 1000 },
    ];

    const storedToken = refreshTokens.find((token) => token.refreshToken === refreshToken);

    if (!storedToken || storedToken.userId !== userId || storedToken.expiry < Date.now()) {
      return res.status(401).json({ error: 'Invalid refresh token' });
    }

    // Generate a new access token with a short expiry time (e.g. 10 minutes)
    const accessToken = jwt.sign({ userId }, secret, { expiresIn: '10m' });

    // Generate a new refresh token with a long expiry time (e.g. 30 days)
    const newRefreshToken = jwt.sign({ userId }, secret, { expiresIn: '30d' });

    // Update the refresh token in the database with the new value and expiry time
    storedToken.refreshToken = newRefreshToken;
    storedToken.expiry = Date.now() + 30 * 24 * 60 * 60 * 1000;

    // Return the new access token and refresh token to the client
    res.json({ accessToken, refreshToken: newRefreshToken });
  });
}
