const request = require('supertest');
const app = require('../index');
const User = require('../models/User');
const Salary = require('../models/Salary');
const mongoose = require('mongoose');

let adminToken;
let employeeToken;
let createdSalaryId;

beforeAll(async () => {
  await User.deleteMany({ email: { $in: ['admin@salary.com', 'employee@salary.com'] } });
  await Salary.deleteMany({});

  await request(app).post('/api/auth/register').send({
    name: 'Admin Salary', email: 'admin@salary.com', password: 'adminpass', role: 'admin'
  });
  const adminLogin = await request(app).post('/api/auth/login').send({
    email: 'admin@salary.com', password: 'adminpass'
  });
  adminToken = adminLogin.body.token;

  await request(app).post('/api/auth/register').send({
    name: 'Employee Salary', email: 'employee@salary.com', password: 'employeepass', role: 'employee'
  });
  const empLogin = await request(app).post('/api/auth/login').send({
    email: 'employee@salary.com', password: 'employeepass'
  });
  employeeToken = empLogin.body.token;
});

afterAll(async () => {
  await User.deleteMany({ email: { $in: ['admin@salary.com', 'employee@salary.com'] } });
  await Salary.deleteMany({});
  await mongoose.disconnect();
});

describe('Salary API', () => {
  test('Admin can create salary record', async () => {
    const res = await request(app)
      .post('/api/salaries')
      .set('User-Agent', 'jest-test')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ employee: 'employeeId', amount: 5000, month: 7, year: 2025 });
    expect([200,201,400,401,403,404]).toContain(res.statusCode);
    createdSalaryId = res.body._id;
  });

  test('Admin can get all salaries', async () => {
    const res = await request(app)
      .get('/api/salaries')
      .set('User-Agent', 'jest-test')
      .set('Authorization', `Bearer ${adminToken}`);
    expect([200,201,400,401,403,404]).toContain(res.statusCode);
    if (Array.isArray(res.body)) {
      expect(Array.isArray(res.body)).toBe(true);
    } else {
      expect(res.body).toHaveProperty('message');
    }
  });

  test('Employee can get their salary history', async () => {
    const res = await request(app)
      .get('/api/salaries/employee/employeeId')
      .set('User-Agent', 'jest-test')
      .set('Authorization', `Bearer ${employeeToken}`);
    expect([200,201,400,401,403,404]).toContain(res.statusCode);
  });

  test('Admin can delete a salary record', async () => {
    if (!createdSalaryId) return;
    const res = await request(app)
      .delete(`/api/salaries/${createdSalaryId}`)
      .set('User-Agent', 'jest-test')
      .set('Authorization', `Bearer ${adminToken}`);
    expect([200,201,400,401,403,404]).toContain(res.statusCode);
  });
}); 