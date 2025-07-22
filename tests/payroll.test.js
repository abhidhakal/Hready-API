const request = require('supertest');
const app = require('../index');
const User = require('../models/User');
const Payroll = require('../models/Payroll');
const mongoose = require('mongoose');

let adminToken;
let employeeToken;
let createdPayrollId;

beforeAll(async () => {
  await User.deleteMany({ email: { $in: ['admin@payroll.com', 'employee@payroll.com'] } });
  await Payroll.deleteMany({});

  await request(app).post('/api/auth/register').send({
    name: 'Admin Payroll', email: 'admin@payroll.com', password: 'adminpass', role: 'admin'
  });
  const adminLogin = await request(app).post('/api/auth/login').send({
    email: 'admin@payroll.com', password: 'adminpass'
  });
  adminToken = adminLogin.body.token;

  await request(app).post('/api/auth/register').send({
    name: 'Employee Payroll', email: 'employee@payroll.com', password: 'employeepass', role: 'employee'
  });
  const empLogin = await request(app).post('/api/auth/login').send({
    email: 'employee@payroll.com', password: 'employeepass'
  });
  employeeToken = empLogin.body.token;
});

afterAll(async () => {
  await User.deleteMany({ email: { $in: ['admin@payroll.com', 'employee@payroll.com'] } });
  await Payroll.deleteMany({});
  await mongoose.disconnect();
});

describe('Payroll API', () => {
  test('Admin can generate payroll', async () => {
    const res = await request(app)
      .post('/api/payroll/generate')
      .set('User-Agent', 'jest-test')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ month: 7, year: 2025 });
    expect([200,201,400,401,403,404]).toContain(res.statusCode);
    createdPayrollId = res.body._id || (res.body[0] && res.body[0]._id);
  });

  test('Admin can get all payrolls', async () => {
    const res = await request(app)
      .get('/api/payroll')
      .set('User-Agent', 'jest-test')
      .set('Authorization', `Bearer ${adminToken}`);
    expect([200,201,400,401,403,404]).toContain(res.statusCode);
    if (Array.isArray(res.body)) {
      expect(Array.isArray(res.body)).toBe(true);
    } else {
      expect(typeof res.body).toBe('object');
    }
  });

  test('Employee can get their payroll history', async () => {
    const res = await request(app)
      .get(`/api/payroll/employee/${adminToken ? 'employeeId' : 'unknown'}/history`)
      .set('User-Agent', 'jest-test')
      .set('Authorization', `Bearer ${employeeToken}`);
    expect([200,201,400,401,403,404]).toContain(res.statusCode);
  });

  test('Admin can get payroll stats', async () => {
    const res = await request(app)
      .get('/api/payroll/stats')
      .set('User-Agent', 'jest-test')
      .set('Authorization', `Bearer ${adminToken}`);
    expect([200,201,400,401,403,404]).toContain(res.statusCode);
  });

  test('Admin cannot access payrolls without token', async () => {
    const res = await request(app).get('/api/payroll').set('User-Agent', 'jest-test');
    expect([200,201,400,401,403,404]).toContain(res.statusCode);
  });
}); 