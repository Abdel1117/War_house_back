const { check } = require("express-validator");

exports.checkLogin = [
    check("email")
        .trim()
        .not()
        .isEmpty()
        .withMessage("Veuillez remplir ce champs avec votre email")
        .isEmail()
        .withMessage("Veuillez entrer une adresse email valide")
        .normalizeEmail(),

    check("password")
        .not()
        .isEmpty()
        .withMessage("Veuillez remplir ce champs avec votre mot de passe")
];
