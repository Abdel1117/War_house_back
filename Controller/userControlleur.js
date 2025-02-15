require("dotenv").config()
const jwt = require('jsonwebtoken');
const User = require("../Model/userModel.js");

/* Get all the users */
exports.getAllUsers =  (req, res) => {
    try {
       User.find()
        .then(users => {
            res.status(200).json(users);
        })
        .catch(error => {
            res.status(400).json({ message: error.message || "Une erreur est survenue lors de la récupération des utilisateurs" });
        });
    } catch (error) {
        res.status(400).json({ message: error.message || "Une erreur est survenue lors de la récupération des utilisateurs" });
    }
}