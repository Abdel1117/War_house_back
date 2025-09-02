const mongoose = require("mongoose");

const user = mongoose.Schema({
    pseudo: { type: String, unique: true, required: true },
    firstName : {type :String, required :true},
    lastName : {type :String, required :true},
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['user', 'premium', 'moderator', 'admin'], default: 'user' },
    birthDate : {type :Date, required :true},
    country : {type : String, required:  true},
    city : {type : String, required:  true},
    hasAcceptedTerms: { type: Boolean, default: false },
    refreshTokens: [{ 
        token: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
        expiresAt: { type: Date, required: true },
        isActive: { type: Boolean, default: true }
    }],
    tokenVersion: { type: Number, default: 0 } // Pour invalider tous les tokens
}, {
    timestamps: true
});

// Index pour nettoyer automatiquement les tokens expirés
user.index({ "refreshTokens.expiresAt": 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('User', user)