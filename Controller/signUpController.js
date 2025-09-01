require("dotenv").config();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { validationResult } = require('express-validator');
const User = require("../Model/userModel.js");
const mongoose = require("mongoose");

exports.signUp = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { pseudo, firstName, lastName, email, password, birthDate, country, city, acceptPrivacyPolicy } = req.body;
    
    // Vérifier si l'utilisateur existe déjà
    const existingUser = await User.findOne({ 
      $or: [{ email }, { pseudo }] 
    });
    
    if (existingUser) {
      return res.status(409).json({ 
        error: existingUser.email === email ? "Cet email est déjà utilisé" : "Ce pseudo est déjà utilisé" 
      });
    }

    // Hacher le mot de passe
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    // Générer un refreshToken
    const refreshToken = jwt.sign(
      { pseudo, email }, 
      process.env.JWT_SECRET || 'default_secret', 
      { expiresIn: '7d' }
    );

    // Créer l'utilisateur
    const user = new User({ 
      pseudo, 
      firstName, 
      lastName, 
      email, 
      password: hashedPassword, 
      birthDate, 
      country, 
      city,
      acceptPrivacyPolicy: acceptPrivacyPolicy || false,
      refreshToken
    });
    
    await user.save();
    
    res.status(201).json({ 
      message: "Utilisateur créé avec succès",
      user: {
        id: user._id,
        pseudo: user.pseudo,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error("Erreur lors de l'inscription:", error);
    
    if (error.code === 11000) {
      // Erreur de duplication MongoDB
      const field = Object.keys(error.keyPattern)[0];
      return res.status(409).json({ 
        error: `Ce ${field} est déjà utilisé` 
      });
    }
    
    res.status(500).json({ 
      error: "Erreur interne du serveur",
      details: process.env.NODE_ENV === 'dev' ? error.message : undefined
    });
  }
};