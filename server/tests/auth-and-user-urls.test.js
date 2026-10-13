const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const app = require('../src/app');
const User = require('../src/models/User');
const { generateToken } = require('../src/utils/token');

describe('Step 24-27 Backend: Auth & User URLs Tests', () => {
    describe('Authentication Endpoints', () => {
        test('POST /api/auth/register fails when required fields are missing', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send({ email: 'test@example.com' });

            assert.equal(res.status, 400);
            assert.equal(res.body.error, 'Name is required');
        });

        test('POST /api/auth/register fails when password is too short', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send({ name: 'Alex', email: 'alex@example.com', password: '123' });

            assert.equal(res.status, 400);
            assert.equal(res.body.error, 'Password must be at least 6 characters long');
        });

        test('POST /api/auth/login fails when fields are missing', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({ email: 'alex@example.com' });

            assert.equal(res.status, 400);
            assert.equal(res.body.error, 'Email and password are required');
        });

        test('GET /api/auth/me returns 401 when token is missing', async () => {
            const res = await request(app).get('/api/auth/me');

            assert.equal(res.status, 401);
            assert.equal(res.body.error, 'Not authorized, token missing');
        });

        test('GET /api/auth/me returns 401 when token is malformed', async () => {
            const res = await request(app)
                .get('/api/auth/me')
                .set('Authorization', 'Bearer invalid-token');

            assert.equal(res.status, 401);
            assert.equal(res.body.error, 'Not authorized, token expired or invalid');
        });

        test('GET /api/urls/user/my-urls returns 401 when not authenticated', async () => {
            const res = await request(app).get('/api/urls/user/my-urls');

            assert.equal(res.status, 401);
            assert.equal(res.body.error, 'Not authorized, token missing');
        });

        test('DELETE /api/urls/:id returns 401 when not authenticated', async () => {
            const res = await request(app).delete('/api/urls/507f1f77bcf86cd799439011');

            assert.equal(res.status, 401);
            assert.equal(res.body.error, 'Not authorized, token missing');
        });
    });
});
