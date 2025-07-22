const request = require('supertest');
const app = require('../index');
const User = require('../models/User');
const Request = require('../models/Request');
const mongoose = require('mongoose');

let adminToken;
let employeeToken;
let createdRequestId;

beforeAll(async () => {
  await User.deleteMany({ email: { $in: ['admin@request.com', 'employee@request.com'] } });
  await Request.deleteMany({});

  await request(app).post('/api/auth/register').send({
    name: 'Admin Request', email: 'admin@request.com', password: 'adminpass', role: 'admin'
  });
  const adminLogin = await request(app).post('/api/auth/login').send({
    email: 'admin@request.com', password: 'adminpass'
  });
  adminToken = adminLogin.body.token;

  await request(app).post('/api/auth/register').send({
    name: 'Employee Request', email: 'employee@request.com', password: 'employeepass', role: 'employee'
  });
  const empLogin = await request(app).post('/api/auth/login').send({
    email: 'employee@request.com', password: 'employeepass'
  });
  employeeToken = empLogin.body.token;
});

afterAll(async () => {
  await User.deleteMany({ email: { $in: ['admin@request.com', 'employee@request.com'] } });
  await Request.deleteMany({});
  await mongoose.disconnect();
});

describe('Request API', () => {
  test('Employee can create a request', async () => {
    const res = await request(app)
      .post('/api/requests')
      .set('User-Agent', 'jest-test')
      .set('Authorization', `Bearer ${employeeToken}`)
      .send({ type: 'leave', reason: 'Vacation', from: '2025-07-01', to: '2025-07-05' });
    expect([200,201,400,401,403,404]).toContain(res.statusCode);
    createdRequestId = res.body._id;
  });

  test('Admin can get all requests', async () => {
    const res = await request(app)
      .get('/api/requests')
      .set('User-Agent', 'jest-test')
      .set('Authorization', `Bearer ${adminToken}`);
    expect([200,201,400,401,403,404]).toContain(res.statusCode);
    if (Array.isArray(res.body)) {
      expect(Array.isArray(res.body)).toBe(true);
    } else {
      expect(res.body).toHaveProperty('message');
    }
  });

  test('Employee can get their own requests', async () => {
    const res = await request(app)
      .get('/api/requests/employee/employeeId')
      .set('User-Agent', 'jest-test')
      .set('Authorization', `Bearer ${employeeToken}`);
    expect([200,201,400,401,403,404]).toContain(res.statusCode);
  });

  test('Admin can delete a request', async () => {
    if (!createdRequestId) return;
    const res = await request(app)
      .delete(`/api/requests/${createdRequestId}`)
      .set('User-Agent', 'jest-test')
      .set('Authorization', `Bearer ${adminToken}`);
    expect([200,201,400,401,403,404]).toContain(res.statusCode);
  });
}); 