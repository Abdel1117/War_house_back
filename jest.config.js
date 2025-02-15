module.exports = {
    // Active un affichage détaillé des tests
    verbose: true,
    
    // Définit l'environnement de test sur Node.js
    testEnvironment: 'node',
    
    // Spécifie les fichiers à considérer comme tests
    testMatch: [
        '**/__tests__/**/*.js?(x)',
        '**/?(*.)+(spec|test).js?(x)'
    ],
    
    // Configure le répertoire pour les rapports de couverture
    coverageDirectory: '<rootDir>/coverage',
    
    // Active la collecte de couverture de code
    collectCoverage: true,
    
    // Vous pouvez étendre la configuration avec d'autres options si nécessaire
};