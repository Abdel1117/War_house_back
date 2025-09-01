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
            pseudo: 'testuser',
            firstName: 'John',
            lastName: 'Doe',
            email: 'john.doe@example.com',
            password: 'TestPassword123!',
            birthDate: '1990-01-01',
            country: 'France',
            city: 'Paris',
            hasAcceptedTerms: true
        };

        User.findOne.mockResolvedValue(null);
        User.prototype.save = jest.fn().mockResolvedValue({
            _id: 'mockId',
            pseudo: userData.pseudo,
            email: userData.email,
            role: 'user'
        });

        const response = await request(app)
            .post('/signUp')
            .send(userData)
            .expect(201);

        expect(response.body.message).toBe('Utilisateur créé avec succès');
        expect(response.body.user).toHaveProperty('pseudo', userData.pseudo);
    });

    it('should return validation errors for invalid data', async () => {
        const invalidData = {
            pseudo: 'a', // Too short
            email: 'invalid-email', // Invalid format
            password: '123' // Too short
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
            pseudo: 'existinguser',
            firstName: 'John',
            lastName: 'Doe',
            email: 'existing@example.com',
            password: 'TestPassword123!',
            birthDate: '1990-01-01',
            country: 'France',
            city: 'Paris',
            hasAcceptedTerms: true
        };

        User.findOne.mockResolvedValue({ email: userData.email });

        const response = await request(app)
            .post('/signUp')
            .send(userData)
            .expect(409);

        expect(response.body.error).toBe('Cet email est déjà utilisé');
    });
});
