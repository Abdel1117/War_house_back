require("dotenv").config();
const jwt = require('jsonwebtoken');
const User = require("../Model/userModel.js");
const { refreshToken } = require("./authController.js");

/* Get all the users */
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find();
        console.log(users);
        res.status(200).json(users);
    } catch (error) {
        res.status(400).json({ message: error.message || "Une erreur est survenue lors de la récupération des utilisateurs" });
    }
};

/* Get a user by ID */
exports.getUserById = async (req, res) => {
    const userId = req.params.id;
    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "Utilisateur non trouvé" });
        }
        res.status(200).json(user);
    } catch (error) {
        res.status(400).json({ message: error.message || "Une erreur est survenue lors de la récupération de l'utilisateur" });
    }
};

/* Get user by token */
exports.getUserByToken = async (req, res) => {
    const token = req.headers['authorization']?.split(' ')[1];
    console.log(token);
    if (!token) {
        return res.status(401).json({ message: "Token manquant" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
        const user = await User.findById(decoded.userId);
        if (!user) {
            return res.status(404).json({ message: "Utilisateur non trouvé" });
        }
        res.status(200).json({

                id: user._id,
                pseudo : user.pseudo,
                email: user.email,
                role: user.role
                
        });
    } catch (error) {
        if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
            return res.status(403).json({ message: "Token invalide" });
        }
        res.status(400).json({ message: error.message || "Une erreur est survenue lors de la récupération de l'utilisateur" });
    }
};