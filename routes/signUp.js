const express = require('express');
const router = express.Router();
const signUpController = require("../Controller/signUpController.js");
const { checkSignUp } = require("../Utils/RegexValidator/RegexValidationSignUp.js");

router.post("/", checkSignUp, signUpController.signUp);

module.exports = router;