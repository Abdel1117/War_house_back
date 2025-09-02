const request = require('supertest');
const app = require('../index');
const User = require('../Model/userModel');
const jwt = require('jsonwebtoken');

// Mock pour la base de données
jest.mock('../Model/userModel');

describe('Auth System', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('POST /auth/login', () => {
        it('should login successfully with valid credentials', async () => {
            const userData = {
                email: 'test@example.com',
                password: 'TestPassword123!'
            };

            const mockUser = {
                _id: 'userId123',
                pseudo: 'testuser',
                email: userData.email,
                password: '$2b$12$hashedpassword', // Mock hashed password
                role: 'user',
                tokenVersion: 0,
                refreshTokens: [],
                save: jest.fn().mockResolvedValue(true)
            };

            User.findOne.mockResolvedValue(mockUser);
            
            // Mock bcrypt.compare to return true
            const bcrypt = require('bcrypt');
            bcrypt.compare = jest.fn().mockResolvedValue(true);

            const response = await request(app)
                .post('/auth/login')
                .send(userData)
                .expect(200);

            expect(response.body.message).toBe('Connexion réussie');
            expect(response.body.accessToken).toBeDefined();
            expect(response.body.refreshToken).toBeDefined();
            expect(response.body.user.email).toBe(userData.email);
        });

        it('should reject invalid credentials', async () => {
            const userData = {
                email: 'test@example.com',
                password: 'WrongPassword'
            };

            User.findOne.mockResolvedValue(null);

            const response = await request(app)
                .post('/auth/login')
                .send(userData)
                .expect(401);

            expect(response.body.error).toBe('Email ou mot de passe incorrect');
        });
    });

    describe('POST /auth/refresh', () => {
        it('should refresh tokens successfully', async () => {
            const refreshToken = jwt.sign(
                { userId: 'userId123', tokenVersion: 0 },
                process.env.JWT_REFRESH_SECRET,
                { expiresIn: '7d' }
            );

            const mockUser = {
                _id: 'userId123',
                pseudo: 'testuser',
                email: 'test@example.com',
                role: 'user',
                tokenVersion: 0,
                refreshTokens: [{
                    token: refreshToken,
                    isActive: true,
                    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                }],
                save: jest.fn().mockResolvedValue(true)
            };

            User.findById.mockResolvedValue(mockUser);

            const response = await request(app)
                .post('/auth/refresh')
                .send({ refreshToken })
                .expect(200);

            expect(response.body.message).toBe('Tokens rafraîchis avec succès');
            expect(response.body.accessToken).toBeDefined();
            expect(response.body.refreshToken).toBeDefined();
        });

        it('should reject invalid refresh token', async () => {
            const response = await request(app)
                .post('/auth/refresh')
                .send({ refreshToken: 'invalid_token' })
                .expect(401);

            expect(response.body.error).toBe('Refresh token invalide ou expiré');
        });
    });

    describe('POST /auth/logout', () => {
        it('should logout successfully', async () => {
            const refreshToken = jwt.sign(
                { userId: 'userId123', tokenVersion: 0 },
                process.env.JWT_REFRESH_SECRET,
                { expiresIn: '7d' }
            );

            const mockUser = {
                _id: 'userId123',
                refreshTokens: [{
                    token: refreshToken,
                    isActive: true
                }],
                save: jest.fn().mockResolvedValue(true)
            };

            User.findById.mockResolvedValue(mockUser);

            const response = await request(app)
                .post('/auth/logout')
                .send({ refreshToken })
                .expect(200);

            expect(response.body.message).toBe('Déconnexion réussie');
        });
    });
});
