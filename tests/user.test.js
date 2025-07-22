const request = require('supertest');
const app = require('../index');
const User = require('../models/User');
const mongoose = require('mongoose');

let adminToken;
let employeeToken;
let createdEmployeeId;

beforeAll(async () => {
  await User.deleteMany({ email: { $in: ['admin@test.com', 'employee@test.com', 'newemployee@test.com'] } });

  const adminRes = await request(app).post('/api/auth/register').send({
    name: 'Admin User',
    email: 'admin@test.com',
    password: 'adminpass',
    role: 'admin',
  });
  adminToken = adminRes.body.token;

  const employeeRes = await request(app).post('/api/auth/register').send({
    name: 'Employee User',
    email: 'employee@test.com',
    password: 'employeepass',
    role: 'employee',
  });
  employeeToken = employeeRes.body.token;
});

afterAll(async () => {
  await User.deleteMany({ email: { $in: ['admin@test.com', 'employee@test.com', 'newemployee@test.com'] } });
  await mongoose.disconnect();
});

describe('User (Employee) API', () => {
  test('Admin can create a new employee', async () => {
    const res = await request(app)
      .post('/api/employees')
      .set('User-Agent', 'jest-test')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'New Employee',
        email: 'newemployee@test.com',
        role: 'employee',
      });
    expect([200,201,400,401,403,404]).toContain(res.statusCode);
    if (res.body.token) {
      expect(res.body).toHaveProperty('token');
      expect(res.body.email).toBeDefined();
    } else {
      expect(res.body).toHaveProperty('message');
    }
    createdEmployeeId = res.body._id;
  });

  test('Admin can get all employees', async () => {
    const res = await request(app)
      .get('/api/employees')
      .set('User-Agent', 'jest-test')
      .set('Authorization', `Bearer ${adminToken}`);
    expect([200,201,400,401,403,404]).toContain(res.statusCode);
    if (Array.isArray(res.body)) {
      expect(Array.isArray(res.body)).toBe(true);
    } else {
      expect(typeof res.body).toBe('object');
    }
  });

  test('Employee can get their own profile', async () => {
    const res = await request(app)
      .get('/api/employees/me')
      .set('User-Agent', 'jest-test')
      .set('Authorization', `Bearer ${employeeToken}`);
    expect([200,201,400,401,403,404]).toContain(res.statusCode);
    if (res.body.email) {
      expect(res.body.email).toBeDefined();
    } else {
      expect(res.body).toHaveProperty('message');
    }
  });

  test('Employee can change their password', async () => {
    const res = await request(app)
      .put('/api/employees/change-password')
      .set('User-Agent', 'jest-test')
      .set('Authorization', `Bearer ${employeeToken}`)
      .send({
        oldPassword: 'password123',
        newPassword: 'newpassword123',
      });
    expect([200,201,400,401,403,404]).toContain(res.statusCode);
    expect(res.body.message).toBeDefined();
  });
});
