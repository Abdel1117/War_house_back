require("dotenv").config();
const bcrypt = require('bcrypt');
const { validationResult } = require('express-validator');
const User = require("../Model/userModel.js");
const {
    generateAccessToken,
    generateRefreshToken,
    getRefreshTokenExpiry
} = require("../Utils/tokenUtils.js");

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
    
    // Créer l'utilisateur sans tokens initialement
    const user = new User({ 
      pseudo, 
      firstName, 
      lastName, 
      email, 
      password: hashedPassword, 
      birthDate, 
      country, 
      city,
      hasAcceptedTerms: acceptPrivacyPolicy || false,
      refreshTokens: [],
      tokenVersion: 0
    });
    
    await user.save();

    
    res.status(201).json({ 
      message: "Utilisateur créé avec succès",
   
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