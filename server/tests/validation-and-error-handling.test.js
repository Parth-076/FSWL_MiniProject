const { test, describe, before, after, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const app = require('../src/app');
const Url = require('../src/models/Url');

describe('Step 10: Validation and Error Handling Tests', () => {

    describe('1. Missing fields validation', () => {
        test('POST /api/urls returns 400 when body is empty', async () => {
            const res = await request(app)
                .post('/api/urls')
                .send({});

            assert.equal(res.status, 400);
            assert.deepEqual(res.body, { error: 'original Url is required' });
        });

        test('POST /api/urls returns 400 when originalUrl is an empty string', async () => {
            const res = await request(app)
                .post('/api/urls')
                .send({ originalUrl: '' });

            assert.equal(res.status, 400);
            assert.deepEqual(res.body, { error: 'original Url is required' });
        });

        test('POST /api/urls returns 400 when originalUrl is whitespace only', async () => {
            const res = await request(app)
                .post('/api/urls')
                .send({ originalUrl: '   ' });

            assert.equal(res.status, 400);
            assert.deepEqual(res.body, { error: 'original Url is required' });
        });
    });

    describe('2. Malformed URLs validation', () => {
        test('POST /api/urls returns 400 for non-URL string', async () => {
            const res = await request(app)
                .post('/api/urls')
                .send({ originalUrl: 'not-a-valid-url' });

            assert.equal(res.status, 400);
            assert.equal(res.body.error, 'Invalid URL format');
        });

        test('POST /api/urls returns 400 for FTP protocol', async () => {
            const res = await request(app)
                .post('/api/urls')
                .send({ originalUrl: 'ftp://ftp.example.com/file.txt' });

            assert.equal(res.status, 400);
            assert.equal(res.body.error, 'URL must use http or https protocol');
        });

        test('POST /api/urls returns 400 for javascript: pseudo-protocol', async () => {
            const res = await request(app)
                .post('/api/urls')
                .send({ originalUrl: 'javascript:alert(1)' });

            assert.equal(res.status, 400);
            assert.equal(res.body.error, 'URL must use http or https protocol');
        });

        test('POST /api/urls returns 400 when originalUrl is not a string', async () => {
            const res = await request(app)
                .post('/api/urls')
                .send({ originalUrl: 12345 });

            assert.equal(res.status, 400);
            assert.equal(res.body.error, 'URL must be a string');
        });

        test('POST /api/urls succeeds for valid HTTP and HTTPS URLs', async () => {
            const res = await request(app)
                .post('/api/urls')
                .send({ originalUrl: 'https://github.com/nodejs/node' });

            assert.equal(res.status, 200);
            assert.equal(res.body.originalUrl, 'https://github.com/nodejs/node');
            assert.ok(res.body.shortCode);
            assert.ok(res.body.message);
        });
    });

    describe('3. Short code parameter validation', () => {
        test('GET /:shortCode returns 400 for invalid short code with special characters', async () => {
            const res = await request(app).get('/$$$invalid-code$$$');

            assert.equal(res.status, 400);
            assert.equal(res.body.error, 'Invalid short code format');
        });

        test('GET /api/urls/:shortCode returns 400 for invalid short code format', async () => {
            const res = await request(app).get('/api/urls/@invalid!');

            assert.equal(res.status, 400);
            assert.equal(res.body.error, 'Invalid short code format');
        });
    });

    describe('4. Invalid ID validation', () => {
        test('GET /api/urls/id/:id returns 400 for non-ObjectId string', async () => {
            const res = await request(app).get('/api/urls/id/invalid-id-123');

            assert.equal(res.status, 400);
            assert.equal(res.body.error, 'Invalid ID format');
        });

        test('GET /api/urls/id/:id returns 400 for short numeric ID', async () => {
            const res = await request(app).get('/api/urls/id/12345');

            assert.equal(res.status, 400);
            assert.equal(res.body.error, 'Invalid ID format');
        });

        test('GET /api/urls/id/:id returns 404 when valid ObjectId is not found in database', async () => {
            const originalFindById = Url.findById;
            Url.findById = async () => null;

            const validNonExistentId = '507f1f77bcf86cd799439011';
            const res = await request(app).get(`/api/urls/id/${validNonExistentId}`);

            assert.equal(res.status, 404);
            assert.equal(res.body.error, 'URL not found');

            Url.findById = originalFindById;
        });
    });

    describe('5. Unknown routes (JSON 404 handler)', () => {
        test('GET /api/nonexistent returns 404 with JSON error', async () => {
            const res = await request(app).get('/api/nonexistent');

            assert.equal(res.status, 404);
            assert.ok(res.body.error);
            assert.match(res.body.error, /Route not found/i);
        });

        test('POST /random/unknown/path returns 404 with JSON error', async () => {
            const res = await request(app).post('/random/unknown/path').send({});

            assert.equal(res.status, 404);
            assert.ok(res.body.error);
            assert.match(res.body.error, /Route not found/i);
        });
    });

    describe('6. Centralized Error Handling & Production Safety', () => {
        test('Returns 400 for malformed JSON request body', async () => {
            const res = await request(app)
                .post('/api/urls')
                .set('Content-Type', 'application/json')
                .send('{"invalidJson": ');

            assert.equal(res.status, 400);
            assert.equal(res.body.error, 'Invalid JSON payload');
        });

        test('Handles unexpected server errors with 500 JSON response', async () => {
            const originalFindOneAndUpdate = Url.findOneAndUpdate;
            Url.findOneAndUpdate = async () => {
                throw new Error('Database connection crashed');
            };

            const res = await request(app).get('/abc1234');

            assert.equal(res.status, 500);
            assert.ok(res.body.error);

            Url.findOneAndUpdate = originalFindOneAndUpdate;
        });

        test('In production mode, 500 errors never leak internal stack traces or database details', async () => {
            const originalEnv = process.env.NODE_ENV;
            process.env.NODE_ENV = 'production';

            const originalFindOneAndUpdate = Url.findOneAndUpdate;
            Url.findOneAndUpdate = async () => {
                throw new Error('mongodb+srv://admin:secretPassword123@cluster.mongodb.net failed');
            };

            const res = await request(app).get('/abc1234');

            assert.equal(res.status, 500);
            assert.equal(res.body.error, 'Internal server error');
            assert.equal(res.body.stack, undefined);
            assert.ok(!JSON.stringify(res.body).includes('secretPassword123'));

            // Restore environment and mock
            process.env.NODE_ENV = originalEnv;
            Url.findOneAndUpdate = originalFindOneAndUpdate;
        });
    });
});
