const express = require('express');
const router = express.Router();
const userControlleur = require("../Controller/userController.js");
const { authenticateToken, requireRole } = require("../middleware/auth.js");



router.get("/user", userControlleur.getUserByToken);

router.get("/user/:id", authenticateToken, userControlleur.getUserById);
/* User Route */
router.get("/getAllUsers", authenticateToken, requireRole(['admin', 'moderator']), userControlleur.getAllUsers);



module.exports = router;