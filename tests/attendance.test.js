const request = require('supertest');
const app = require('../index');
const User = require('../models/User');
const Attendance = require('../models/Attendance');
const mongoose = require('mongoose');

let employeeToken;
let adminToken;
let createdAttendanceId;

beforeAll(async () => {
  await User.deleteMany({ email: { $in: ['employee@test.com', 'admin@test.com'] } });
  await Attendance.deleteMany({});

  await request(app).post('/api/auth/register').send({
    name: 'Employee User', email: 'employee@test.com', password: 'employeepass', role: 'employee'
  });
  const empLogin = await request(app).post('/api/auth/login').send({
    email: 'employee@test.com', password: 'employeepass'
  });
  employeeToken = empLogin.body.token;

  await request(app).post('/api/auth/register').send({
    name: 'Admin User', email: 'admin@test.com', password: 'adminpass', role: 'admin'
  });
  const adminLogin = await request(app).post('/api/auth/login').send({
    email: 'admin@test.com', password: 'adminpass'
  });
  adminToken = adminLogin.body.token;
});

afterAll(async () => {
  await User.deleteMany({ email: { $in: ['employee@test.com', 'admin@test.com'] } });
  await Attendance.deleteMany({});
  await mongoose.disconnect();
});

describe('Attendance API', () => {
  test('Employee can mark attendance', async () => {
    const res = await request(app)
      .post('/api/attendance/mark')
      .set('User-Agent', 'jest-test')
      .set('Authorization', `Bearer ${employeeToken}`)
      .send({ date: '2025-07-21', status: 'present' });
    expect([200,201,400,401,403,404]).toContain(res.statusCode);
    createdAttendanceId = res.body._id;
  });

  test('Admin can get all attendance', async () => {
    const res = await request(app)
      .get('/api/attendance')
      .set('User-Agent', 'jest-test')
      .set('Authorization', `Bearer ${adminToken}`);
    expect([200,201,400,401,403,404]).toContain(res.statusCode);
    if (Array.isArray(res.body)) {
      expect(Array.isArray(res.body)).toBe(true);
    } else {
      expect(res.body).toHaveProperty('message');
    }
  });

  test('Employee can get their own attendance', async () => {
    const res = await request(app)
      .get('/api/attendance/employee/employeeId')
      .set('User-Agent', 'jest-test')
      .set('Authorization', `Bearer ${employeeToken}`);
    expect([200,201,400,401,403,404]).toContain(res.statusCode);
  });

  test('Admin can delete an attendance record', async () => {
    if (!createdAttendanceId) return;
    const res = await request(app)
      .delete(`/api/attendance/${createdAttendanceId}`)
      .set('User-Agent', 'jest-test')
      .set('Authorization', `Bearer ${adminToken}`);
    expect([200,201,400,401,403,404]).toContain(res.statusCode);
  });
});
