require("dotenv").config();
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

/**
 * Génère un access token JWT
 */
const generateAccessToken = (user) => {
    return jwt.sign(
        { 
            userId: user._id,
            pseudo: user.pseudo,
            email: user.email,
            role: user.role,
            tokenVersion: user.tokenVersion
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.ACCESS_TOKEN_EXPIRY || '15m' }
    );
};

/**
 * Génère un refresh token JWT
 */
const generateRefreshToken = (user) => {
    return jwt.sign(
        { 
            userId: user._id,
            tokenVersion: user.tokenVersion,
            jti: crypto.randomUUID() // JWT ID unique pour ce token
        },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: process.env.REFRESH_TOKEN_EXPIRY || '7d' }
    );
};

/**
 * Vérifie un access token
 */
const verifyAccessToken = (token) => {
    return jwt.verify(token, process.env.JWT_SECRET);
};

/**
 * Vérifie un refresh token
 */
const verifyRefreshToken = (token) => {
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
};

/**
 * Calcule la date d'expiration d'un refresh token
 */
const getRefreshTokenExpiry = () => {
    const expiry = process.env.REFRESH_TOKEN_EXPIRY || '7d';
    const days = parseInt(expiry.replace('d', ''));
    return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
};

/**
 * Nettoie les refresh tokens expirés d'un utilisateur
 */
const cleanExpiredTokens = async (user) => {
    const now = new Date();
    user.refreshTokens = user.refreshTokens.filter(tokenObj => 
        tokenObj.expiresAt > now && tokenObj.isActive
    );
    return user;
};

/**
 * Limite le nombre de refresh tokens par utilisateur
 */
const limitRefreshTokens = async (user) => {
    const maxTokens = parseInt(process.env.MAX_REFRESH_TOKENS) || 5;
    
    if (user.refreshTokens.length >= maxTokens) {
        // Supprimer les plus anciens tokens
        user.refreshTokens.sort((a, b) => a.createdAt - b.createdAt);
        user.refreshTokens = user.refreshTokens.slice(-(maxTokens - 1));
    }
    
    return user;
};

module.exports = {
    generateAccessToken,
    generateRefreshToken,
    verifyAccessToken,
    verifyRefreshToken,
    getRefreshTokenExpiry,
    cleanExpiredTokens,
    limitRefreshTokens
};
