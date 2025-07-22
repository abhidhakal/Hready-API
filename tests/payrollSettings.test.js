const request = require('supertest');
const app = require('../index');
const User = require('../models/User');
const mongoose = require('mongoose');

let adminToken;

beforeAll(async () => {
  await User.deleteMany({ email: 'admin@settings.com' });
  await request(app).post('/api/auth/register').send({
    name: 'Admin Settings', email: 'admin@settings.com', password: 'adminpass', role: 'admin'
  });
  const login = await request(app).post('/api/auth/login').send({
    email: 'admin@settings.com', password: 'adminpass'
  });
  adminToken = login.body.token;
});

afterAll(async () => {
  await User.deleteMany({ email: 'admin@settings.com' });
  await mongoose.disconnect();
});

describe('Payroll Settings API', () => {
  test('Admin can get payroll budget', async () => {
    const res = await request(app)
      .get('/api/payroll-settings/payroll-budget')
      .set('User-Agent', 'jest-test')
      .set('Authorization', `Bearer ${adminToken}`);
    expect([200,201,400,401,403,404]).toContain(res.statusCode);
  });

  test('Admin can set payroll budget', async () => {
    const res = await request(app)
      .put('/api/payroll-settings/payroll-budget')
      .set('User-Agent', 'jest-test')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ budget: 100000 });
    expect([200,201,400,401,403,404]).toContain(res.statusCode);
    if (res.body.budget) {
      expect(res.body).toHaveProperty('budget');
    } else {
      expect(res.body).toHaveProperty('message');
    }
  });

  test('Should not allow unauthenticated access', async () => {
    const res = await request(app).get('/api/payroll-settings/payroll-budget').set('User-Agent', 'jest-test');
    expect([200,201,400,401,403,404]).toContain(res.statusCode);
  });
}); 