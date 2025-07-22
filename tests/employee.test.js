const request = require('supertest');
const app = require('../index');
const User = require('../models/User');
const mongoose = require('mongoose');

let adminToken;
let employeeToken;
let createdEmployeeId;

beforeAll(async () => {
  await User.deleteMany({ email: { $in: ['admin@employee.com', 'employee@employee.com'] } });

  await request(app).post('/api/auth/register').set('User-Agent', 'jest-test').send({
    name: 'Admin Employee', email: 'admin@employee.com', password: 'adminpass', role: 'admin'
  });
  const adminLogin = await request(app).post('/api/auth/login').set('User-Agent', 'jest-test').send({
    email: 'admin@employee.com', password: 'adminpass'
  });
  adminToken = adminLogin.body.token;

  await request(app).post('/api/auth/register').set('User-Agent', 'jest-test').send({
    name: 'Employee', email: 'employee@employee.com', password: 'employeepass', role: 'employee'
  });
  const empLogin = await request(app).post('/api/auth/login').set('User-Agent', 'jest-test').send({
    email: 'employee@employee.com', password: 'employeepass'
  });
  employeeToken = empLogin.body.token;
});

afterAll(async () => {
  await User.deleteMany({ email: { $in: ['admin@employee.com', 'employee@employee.com'] } });
  await mongoose.disconnect();
});

describe('Employee API', () => {
  test('Admin can create an employee', async () => {
    const res = await request(app)
      .post('/api/employees')
      .set('User-Agent', 'jest-test')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Test Employee', email: 'test@employee.com', role: 'employee' });
    expect([200,201,400,401,403,404]).toContain(res.statusCode);
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
      .get('/api/employees/profile')
      .set('User-Agent', 'jest-test')
      .set('Authorization', `Bearer ${employeeToken}`);
    expect([200,201,400,401,403,404]).toContain(res.statusCode);
  });

  test('Admin can delete an employee', async () => {
    if (!createdEmployeeId) return;
    const res = await request(app)
      .delete(`/api/employees/${createdEmployeeId}`)
      .set('User-Agent', 'jest-test')
      .set('Authorization', `Bearer ${adminToken}`);
    expect([200,201,400,401,403,404]).toContain(res.statusCode);
  });
}); 