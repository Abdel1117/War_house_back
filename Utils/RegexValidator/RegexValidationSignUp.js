const { check, validationResult } = require("express-validator");

exports.checkSignUp = [
    check("pseudo")
        .trim()
        .not()
        .isEmpty()
        .withMessage("Veuillez remplir ce champs avec un pseudo")
        .isLength({ min: 3, max: 20 })
        .withMessage("Veuillez taper un pseudo qui contient 3 à 20 caractères")
        .isAlphanumeric()
        .withMessage("Le pseudo ne peut contenir que des lettres et des chiffres"),

    check("firstName")
        .trim()
        .not()
        .isEmpty()
        .withMessage("Veuillez remplir ce champs avec votre prénom")
        .isLength({ min: 2, max: 30 })
        .withMessage("Veuillez taper un prénom qui contient 2 à 30 caractères")
        .isAlpha()
        .withMessage("Le prénom ne peut contenir que des lettres"),

    check("lastName")
        .trim()
        .not()
        .isEmpty()
        .withMessage("Veuillez remplir ce champs avec votre nom")
        .isLength({ min: 2, max: 30 })
        .withMessage("Veuillez taper un nom qui contient 2 à 30 caractères")
        .isAlpha()
        .withMessage("Le nom ne peut contenir que des lettres"),

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
        .withMessage("Veuillez remplir ce champs avec un mot de passe")
        .isLength({ min: 8 })
        .withMessage("Le mot de passe doit contenir au moins 8 caractères")
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
        .withMessage("Le mot de passe doit contenir au moins une majuscule, une minuscule, un chiffre et un caractère spécial"),

    check("birthDate")
        .not()
        .isEmpty()
        .withMessage("Veuillez remplir ce champs avec votre date de naissance")
        .isISO8601()
        .withMessage("Veuillez entrer une date valide")
        .custom(value => {
            const today = new Date();
            const birthDate = new Date(value);
            const age = today.getFullYear() - birthDate.getFullYear();
            if (age < 13) {
                throw new Error("Vous devez avoir au moins 13 ans pour vous inscrire");
            }
            return true;
        }),

    check("country")
        .trim()
        .not()
        .isEmpty()
        .withMessage("Veuillez remplir ce champs avec votre pays")
        .isLength({ min: 2, max: 50 })
        .withMessage("Veuillez taper un pays qui contient 2 à 50 caractères"),

    check("city")
        .trim()
        .not()
        .isEmpty()
        .withMessage("Veuillez remplir ce champs avec votre ville")
        .isLength({ min: 2, max: 50 })
        .withMessage("Veuillez taper une ville qui contient 2 à 50 caractères"),

    check("acceptPrivacyPolicy")
        .isBoolean()
        .withMessage("Veuillez accepter les conditions d'utilisation")
        .custom(value => {
            if (!value) {
                throw new Error("Vous devez accepter les conditions d'utilisation pour vous inscrire");
            }
            return true;
        })
];