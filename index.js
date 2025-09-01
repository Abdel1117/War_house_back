const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const signUpRoute = require('./routes/signUp');
const userRoute = require('./routes/userRoute');
require("dotenv").config();

const app = express();
const FRONT_APP = process.env.FRONT_APP_URL || "http://localhost:5173";
console.log(FRONT_APP)


app.use(express.json());

/* Gestion de CORS */
app.use(cors("*"));
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', FRONT_APP);
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

app.use("/users", userRoute);
app.use("/signUp", signUpRoute);


app.use("/", (req, res, next) => {
  res.send("API is running");
  console.log("API is running");
  next();
});

module.exports = app;
