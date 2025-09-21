require("dotenv").config();
const bcrypt = require('bcrypt');
const { validationResult } = require('express-validator');
const User = require("../Model/userModel.js");
const {
    generateAccessToken,
    generateRefreshToken,
    verifyRefreshToken,
    getRefreshTokenExpiry,
    cleanExpiredTokens,
    limitRefreshTokens
} = require("../Utils/tokenUtils.js");

/**
 * Connexion utilisateur avec génération de tokens
 */
exports.login = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { email, password } = req.body;

        // Vérifier si l'utilisateur existe
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ error: "Email ou mot de passe incorrect" });
        }

        // Vérifier le mot de passe
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ error: "Email ou mot de passe incorrect" });
        }

        // Nettoyer les tokens expirés
        await cleanExpiredTokens(user);
        await limitRefreshTokens(user);

        // Générer les nouveaux tokens
        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);

        // Stocker le refresh token dans la base
        user.refreshTokens.push({
            token: refreshToken,
            expiresAt: getRefreshTokenExpiry(),
            isActive: true
        });

        await user.save();

        res.status(200).json({
            message: "Connexion réussie",
            accessToken,
            refreshToken,
            user: {
                id: user._id,
                pseudo: user.pseudo,
                email: user.email,
                role: user.role,
                birthDate: user.birthDate
            }
        });

    } catch (error) {
        console.error("Erreur lors de la connexion:", error);
        res.status(500).json({ 
            error: "Erreur interne du serveur",
            details: process.env.NODE_ENV === 'dev' ? error.message : undefined
        });
    }
};

/**
 * Rafraîchissement des tokens avec rotation
 */
exports.refreshToken = async (req, res) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(401).json({ error: "Refresh token manquant" });
        }

        // Vérifier le refresh token
        let decoded;
        try {
            decoded = verifyRefreshToken(refreshToken);
        } catch (error) {
            return res.status(401).json({ error: "Refresh token invalide ou expiré" });
        }

        // Récupérer l'utilisateur
        const user = await User.findById(decoded.userId);
        if (!user) {
            return res.status(401).json({ error: "Utilisateur non trouvé" });
        }

        // Vérifier la version du token
        if (user.tokenVersion !== decoded.tokenVersion) {
            return res.status(401).json({ error: "Token révoqué" });
        }

        // Vérifier que le refresh token existe dans la base et est actif
        const tokenIndex = user.refreshTokens.findIndex(
            tokenObj => tokenObj.token === refreshToken && tokenObj.isActive
        );

        if (tokenIndex === -1) {
            return res.status(401).json({ error: "Refresh token non trouvé ou inactif" });
        }

        // Nettoyer les tokens expirés
        await cleanExpiredTokens(user);

        // Invalider l'ancien refresh token (rotation)
        user.refreshTokens[tokenIndex].isActive = false;

        // Générer de nouveaux tokens
        const newAccessToken = generateAccessToken(user);
        const newRefreshToken = generateRefreshToken(user);

        // Stocker le nouveau refresh token
        user.refreshTokens.push({
            token: newRefreshToken,
            expiresAt: getRefreshTokenExpiry(),
            isActive: true
        });

        // Limiter le nombre de tokens
        await limitRefreshTokens(user);
        await user.save();

        res.status(200).json({
            message: "Tokens rafraîchis avec succès",
            accessToken: newAccessToken,
            refreshToken: newRefreshToken
        });

    } catch (error) {
        console.error("Erreur lors du rafraîchissement:", error);
        res.status(500).json({ 
            error: "Erreur interne du serveur",
            details: process.env.NODE_ENV === 'dev' ? error.message : undefined
        });
    }
};

/**
 * Déconnexion (invalide le refresh token)
 */
exports.logout = async (req, res) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(400).json({ error: "Refresh token manquant" });
        }

        // Décoder sans vérifier l'expiration pour récupérer l'userId
        const jwt = require('jsonwebtoken');
        const decoded = jwt.decode(refreshToken);
        if (!decoded || !decoded.userId) {
            return res.status(400).json({ error: "Token invalide" });
        }

        // Récupérer l'utilisateur et invalider le token
        const user = await User.findById(decoded.userId);
        if (user) {
            const tokenIndex = user.refreshTokens.findIndex(
                tokenObj => tokenObj.token === refreshToken
            );
            
            if (tokenIndex !== -1) {
                user.refreshTokens[tokenIndex].isActive = false;
                await user.save();
            }
        }

        res.status(200).json({ message: "Déconnexion réussie" });

    } catch (error) {
        console.error("Erreur lors de la déconnexion:", error);
        res.status(500).json({ error: "Erreur interne du serveur" });
    }
};

/**
 * Déconnexion de tous les appareils (invalide tous les tokens)
 */
exports.logoutAll = async (req, res) => {
    try {
        const userId = req.user._id; // Récupéré du middleware d'auth

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: "Utilisateur non trouvé" });
        }

        // Incrémenter la version du token pour invalider tous les tokens existants
        user.tokenVersion += 1;
        user.refreshTokens = []; // Vider tous les refresh tokens

        await user.save();

        res.status(200).json({ message: "Déconnexion de tous les appareils réussie" });

    } catch (error) {
        console.error("Erreur lors de la déconnexion globale:", error);
        res.status(500).json({ error: "Erreur interne du serveur" });
    }
};
