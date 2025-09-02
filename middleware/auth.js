const jwt = require('jsonwebtoken');
const User = require("../Model/userModel.js");
const { verifyAccessToken, verifyRefreshToken } = require("../Utils/tokenUtils.js");

/**
 * Middleware d'authentification par access token uniquement
 */
exports.authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            return res.status(401).json({ error: 'Access token non fourni' });
        }

        // Vérifier le token
        const decoded = verifyAccessToken(token);
        console.log("==========================")
        console.log(decoded.userId)
        console.log("==========================")
        // Récupérer l'utilisateur
        const user = await User.findById(decoded.userId).select('-password -refreshTokens');
        console.log(user)
        if (!user) {
            return res.status(404).json({ error: 'Utilisateur non trouvé' });
        }

        // Vérifier la version du token
        if (user.tokenVersion !== decoded.tokenVersion) {
            return res.status(401).json({ error: 'Token révoqué' });
        }

        req.user = user;
        next();

    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            return res.status(401).json({ error: 'Access token expiré' });
        }
        if (error instanceof jwt.JsonWebTokenError) {
            return res.status(401).json({ error: 'Access token invalide' });
        }
        
        console.error("Erreur d'authentification:", error);
        return res.status(500).json({ error: 'Erreur interne du serveur' });
    }
};

/**
 * Middleware d'authentification avec auto-refresh (optionnel)
 * Utilise le refresh token automatiquement si l'access token est expiré
 */
exports.authenticateWithAutoRefresh = async (req, res, next) => {
    try {
        // 1. Tenter l'authentification avec l'access token
        const authHeader = req.headers.authorization;
        const accessToken = authHeader && authHeader.split(' ')[1];
        
        if (accessToken) {
            try {
                const decoded = verifyAccessToken(accessToken);
                const user = await User.findById(decoded.userId).select('-password -refreshTokens');
                
                if (user && user.tokenVersion === decoded.tokenVersion) {
                    req.user = user;
                    return next();
                }
            } catch (error) {
                // Si ce n'est pas une expiration, on échoue
                if (!(error instanceof jwt.TokenExpiredError)) {
                    return res.status(401).json({ error: 'Access token invalide' });
                }
                // Sinon on continue vers le refresh
            }
        }

        // 2. Tenter le refresh avec le refresh token
        const refreshToken = req.headers['x-refresh-token'] || req.body.refreshToken;
        
        if (!refreshToken) {
            return res.status(401).json({ error: 'Tokens manquants' });
        }

        try {
            const decoded = verifyRefreshToken(refreshToken);
            const user = await User.findById(decoded.userId);
            
            if (!user || user.tokenVersion !== decoded.tokenVersion) {
                return res.status(401).json({ error: 'Refresh token invalide' });
            }

            // Vérifier que le refresh token existe et est actif
            const tokenExists = user.refreshTokens.some(
                tokenObj => tokenObj.token === refreshToken && 
                           tokenObj.isActive && 
                           tokenObj.expiresAt > new Date()
            );

            if (!tokenExists) {
                return res.status(401).json({ error: 'Refresh token non trouvé ou expiré' });
            }

            // Générer de nouveaux tokens (déléguer au contrôleur)
            req.needsTokenRefresh = true;
            req.refreshTokenToUse = refreshToken;
            req.user = user;
            next();

        } catch (error) {
            return res.status(401).json({ error: 'Refresh token invalide' });
        }

    } catch (error) {
        console.error("Erreur d'authentification avec auto-refresh:", error);
        return res.status(500).json({ error: 'Erreur interne du serveur' });
    }
};

/**
 * Middleware pour vérifier les rôles
 */
exports.requireRole = (roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: 'Authentification requise' });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ error: 'Droits insuffisants' });
        }

        next();
    };
};
