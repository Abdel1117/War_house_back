const mongoose = require("mongoose");

const user = mongoose.Schema({
    pseudo: { type: String, required: true },
    email: { type: String, required: true },
});


module.exports = mongoose.model('User', user);
