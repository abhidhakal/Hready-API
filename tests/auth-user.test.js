const request = require('supertest');
const app = require('../index');
const User = require('../models/User');
const mongoose = require('mongoose');

describe('Extra Auth/User Edge Cases', () => {
  beforeAll(async () => {
    await User.deleteOne({ email: 'testuser@example.com' });
    await request(app).post('/api/auth/register').send({
      name: 'Test User',
      email: 'testuser@example.com',
      password: 'password123',
      role: 'employee',
    });
  });

  afterAll(async () => {
    await User.deleteOne({ email: 'testuser@example.com' });
    await mongoose.disconnect();
  });

  test('should not allow duplicate registration', async () => {
    const res = await request(app).post('/api/auth/register').set('User-Agent', 'jest-test').send({
      name: 'Test User',
      email: 'testuser@example.com',
      password: 'password123',
      role: 'employee',
    });
    expect([400,403]).toContain(res.statusCode);
    expect(typeof res.body.message).toBe('string');
  });

  test('should fail login with unregistered email', async () => {
    const res = await request(app).post('/api/auth/login').set('User-Agent', 'jest-test').send({
      email: 'nosuchuser@example.com',
      password: 'somepassword',
    });
    expect([401,403]).toContain(res.statusCode);
    expect(typeof res.body.message).toBe('string');
  });

  test('should deny access to protected route without token', async () => {
    const res = await request(app).get('/api/employees/me');
    expect([401,403]).toContain(res.statusCode);
    expect(res.body.message).toMatch(/no token/i);
  });
});
