const { check } = require("express-validator");


exports.createOrUpdateValidators = [
  check('title').isString().trim().notEmpty().withMessage('Titre requis'),
  check('resolution').isString().trim().notEmpty().withMessage('Resolution requise'),
  check('category').optional().isArray().withMessage('Veuillez fournir au moins une catégorie'),
  check('addedBy').isString().trim().notEmpty().withMessage('Utilisateur requis'),
  check('published').optional().isISO8601().toDate(),
  check('favorite').optional().isInt({ min: 0 }),
  check('pegi18').optional().isBoolean(),
  check('view').optional().isInt({ min: 0 })
];