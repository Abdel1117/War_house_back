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
    acceptPrivacyPolicy: { type: Boolean, default: false },
    refreshToken: { type: String, required: false }
}, {
    timestamps: true
});


module.exports = mongoose.model('User', user);
