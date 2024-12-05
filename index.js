const express = require('express');
const app = express();
const mongoose = require("mongoose");



app.use(express.json())


/* We handle the cors here */

app.use(corse(corsOption))

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', FRONT_URL);
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
})
/* ENd of cors handling */
app.get("/", (req, res, next) => {
  res.send("Hello")
})

module.exports = app;