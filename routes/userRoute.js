const express = require('express');
const router = express.Router();
const userControlleur = require("../Controller/userControlleur.js");


/* User Route */
router.get("/getAllUsers", userControlleur.getAllUsers)



module.exports = router