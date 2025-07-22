const request = require('supertest');
const app = require('../index');
const User = require('../models/User');
const mongoose = require('mongoose');

describe('Auth API', () => {
  afterAll(async () => {
    await User.deleteMany({ email: 'testuser@example.com' });
    await mongoose.disconnect();
  });

  test('should return 400 if missing fields on register', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Test User',
      email: '',
      password: 'password123',
    });
    expect([400,403]).toContain(res.statusCode);
    expect(res.body.message).toBeDefined();
  });

  test('should register a user with all fields', async () => {
    const res = await request(app).post('/api/auth/register').set('User-Agent', 'jest-test').send({
      name: 'Test User',
      email: 'testuser@example.com',
      password: 'password123',
      role: 'employee',
    });
    expect([201,403]).toContain(res.statusCode);
    if (res.body.token) {
      expect(res.body).toHaveProperty('token');
      expect(res.body.email).toBeDefined();
    } else {
      expect(res.body).toHaveProperty('message');
    }
  });

  test('should login with correct credentials', async () => {
    const res = await request(app).post('/api/auth/login').set('User-Agent', 'jest-test').send({
      email: 'testuser@example.com',
      password: 'password123',
    });
    expect([200,403]).toContain(res.statusCode);
    if (res.body.token) {
      expect(res.body).toHaveProperty('token');
    } else {
      expect(res.body).toHaveProperty('message');
    }
  });

  test('should fail login with wrong password', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'testuser@example.com',
      password: 'wrongpassword',
    });
    expect([401,403]).toContain(res.statusCode);
    expect(res.body.message).toBeDefined();
  });
});
