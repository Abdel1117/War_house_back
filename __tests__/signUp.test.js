const request = require('supertest');
const app = require('../index');
const User = require('../Model/userModel');

// Mock pour la base de données
jest.mock('../Model/userModel');

describe('POST /signUp', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should create a new user with valid data', async () => {
        const userData = {
            pseudo: 'Abdel',
            firstName: 'Abderahmane',
            lastName: 'Adjali',
            email: 'abderahmane.adjali@live.fr',
            password: 'Motdepasse123?',
            confirmPassword: 'Motdepasse123?',
            birthDate: '1996-02-18',
            country: 'France',
            city: 'Aulnay-sous-Bois',
            acceptPrivacyPolicy: true
        };

        // Mock pour vérifier si l'utilisateur existe déjà
        User.findOne.mockResolvedValue(null);
        
        // Créer une instance mockée avec la méthode save
        const mockUserInstance = {
            _id: 'mockId123',
            pseudo: userData.pseudo,
            firstName: userData.firstName,
            lastName: userData.lastName,
            email: userData.email,
            birthDate: userData.birthDate,
            country: userData.country,
            city: userData.city,
            role: 'user',
            acceptPrivacyPolicy: userData.acceptPrivacyPolicy,
            save: jest.fn().mockResolvedValue({
                _id: 'mockId123',
                pseudo: userData.pseudo,
                firstName: userData.firstName,
                lastName: userData.lastName,
                email: userData.email,
                birthDate: userData.birthDate,
                country: userData.country,
                city: userData.city,
                role: 'user',
                acceptPrivacyPolicy: userData.acceptPrivacyPolicy
            })
        };

        // Mock du constructeur User pour retourner notre instance mockée
        User.mockImplementation(() => mockUserInstance);

        const response = await request(app)
            .post('/signUp')
            .send(userData)
            .expect(201);

        expect(response.body.message).toBe('Utilisateur créé avec succès');
        expect(response.body.user).toHaveProperty('id', 'mockId123');
        expect(response.body.user).toHaveProperty('pseudo', userData.pseudo);
        expect(response.body.user).toHaveProperty('email', userData.email);
        expect(response.body.user).toHaveProperty('role', 'user');
        
        // Vérifier que save a été appelé
        expect(mockUserInstance.save).toHaveBeenCalled();
    });

    it('should return validation errors for invalid data', async () => {
        const invalidData = {
            pseudo: 'a', // Too short
            firstName: '', // Empty
            lastName: '', // Empty
            email: 'invalid-email', // Invalid format
            password: '123', // Too short
            birthDate: 'invalid-date', // Invalid date
            country: '', // Empty
            city: '', // Empty
            acceptPrivacyPolicy: false // Not accepted
        };

        const response = await request(app)
            .post('/signUp')
            .send(invalidData)
            .expect(400);

        expect(response.body.errors).toBeDefined();
        expect(Array.isArray(response.body.errors)).toBe(true);
    });

    it('should return error if user already exists', async () => {
        const userData = {
            pseudo: 'ExistingUser',
            firstName: 'Jean',
            lastName: 'Dupont',
            email: 'jean.dupont@gmail.com',
            password: 'MotDePasse123!',
            confirmPassword: 'MotDePasse123!',
            birthDate: '1985-05-15',
            country: 'France',
            city: 'Lyon',
            acceptPrivacyPolicy: true
        };

        User.findOne.mockResolvedValue({ email: userData.email });

        const response = await request(app)
            .post('/signUp')
            .send(userData)
            .expect(409);

        expect(response.body.error).toBe('Ce pseudo est déjà utilisé');
    });
});