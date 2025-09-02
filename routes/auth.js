const express = require('express');
const router = express.Router();
const authController = require("../Controller/authController.js");
const { authenticateToken } = require("../middleware/auth.js");
const { checkLogin } = require("../Utils/RegexValidator/RegexValidationLogin.js");

// Connexion
router.post("/login", checkLogin, authController.login);



// Rafraîchissement des tokens
router.post("/refresh", authController.refreshToken);

// Déconnexion
router.post("/logout", authController.logout);

// Déconnexion de tous les appareils (nécessite authentification)
router.post("/logout-all", authenticateToken, authController.logoutAll);

module.exports = router;
