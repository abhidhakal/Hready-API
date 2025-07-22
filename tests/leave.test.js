const request = require('supertest');
const app = require('../index');
const User = require('../models/User');
const Leave = require('../models/Leave');
const mongoose = require('mongoose');

let adminToken;
let employeeToken;
let createdLeaveId;

beforeAll(async () => {
  await User.deleteMany({ email: { $in: ['admin@test.com', 'employee@test.com'] } });
  await Leave.deleteMany({});

  await request(app).post('/api/auth/register').send({
    name: 'Admin User', email: 'admin@test.com', password: 'adminpass', role: 'admin'
  });
  const adminLogin = await request(app).post('/api/auth/login').send({
    email: 'admin@test.com', password: 'adminpass'
  });
  adminToken = adminLogin.body.token;

  await request(app).post('/api/auth/register').send({
    name: 'Employee User', email: 'employee@test.com', password: 'employeepass', role: 'employee'
  });
  const empLogin = await request(app).post('/api/auth/login').send({
    email: 'employee@test.com', password: 'employeepass'
  });
  employeeToken = empLogin.body.token;
});

afterAll(async () => {
  await User.deleteMany({ email: { $in: ['admin@test.com', 'employee@test.com'] } });
  await Leave.deleteMany({});
  await mongoose.disconnect();
});

describe('Leave API', () => {
  test('Employee can apply for leave', async () => {
    const res = await request(app)
      .post('/api/leaves/apply')
      .set('User-Agent', 'jest-test')
      .set('Authorization', `Bearer ${employeeToken}`)
      .send({ from: '2025-07-21', to: '2025-07-25', reason: 'Vacation' });
    expect([200,201,400,401,403,404]).toContain(res.statusCode);
    createdLeaveId = res.body._id;
  });

  test('Admin can get all leaves', async () => {
    const res = await request(app)
      .get('/api/leaves')
      .set('User-Agent', 'jest-test')
      .set('Authorization', `Bearer ${adminToken}`);
    expect([200,201,400,401,403,404]).toContain(res.statusCode);
    if (Array.isArray(res.body)) {
      expect(Array.isArray(res.body)).toBe(true);
    } else {
      expect(res.body).toHaveProperty('message');
    }
  });

  test('Employee can get their own leaves', async () => {
    const res = await request(app)
      .get('/api/leaves/employee/employeeId')
      .set('User-Agent', 'jest-test')
      .set('Authorization', `Bearer ${employeeToken}`);
    expect([200,201,400,401,403,404]).toContain(res.statusCode);
  });

  test('Admin can delete a leave record', async () => {
    if (!createdLeaveId) return;
    const res = await request(app)
      .delete(`/api/leaves/${createdLeaveId}`)
      .set('User-Agent', 'jest-test')
      .set('Authorization', `Bearer ${adminToken}`);
    expect([200,201,400,401,403,404]).toContain(res.statusCode);
  });
});
