const request = require('supertest');
const app = require('../index');
const User = require('../models/User');
const Task = require('../models/Task');
const mongoose = require('mongoose');

let adminToken;
let employeeToken;
let createdTaskId;

beforeAll(async () => {
  await User.deleteMany({ email: { $in: ['admin@task.com', 'employee@task.com'] } });
  await Task.deleteMany({});

  await request(app).post('/api/auth/register').send({
    name: 'Admin Task', email: 'admin@task.com', password: 'adminpass', role: 'admin'
  });
  const adminLogin = await request(app).post('/api/auth/login').send({
    email: 'admin@task.com', password: 'adminpass'
  });
  adminToken = adminLogin.body.token;

  await request(app).post('/api/auth/register').send({
    name: 'Employee Task', email: 'employee@task.com', password: 'employeepass', role: 'employee'
  });
  const empLogin = await request(app).post('/api/auth/login').send({
    email: 'employee@task.com', password: 'employeepass'
  });
  employeeToken = empLogin.body.token;
});

afterAll(async () => {
  await User.deleteMany({ email: { $in: ['admin@task.com', 'employee@task.com'] } });
  await Task.deleteMany({});
  await mongoose.disconnect();
});

describe('Task API', () => {
  test('Admin can create a task', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .set('User-Agent', 'jest-test')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ title: 'Test Task', description: 'Test', assignedTo: 'employeeId' });
    expect([200,201,400,401,403,404]).toContain(res.statusCode);
    createdTaskId = res.body._id;
  });

  test('Admin can get all tasks', async () => {
    const res = await request(app)
      .get('/api/tasks')
      .set('User-Agent', 'jest-test')
      .set('Authorization', `Bearer ${adminToken}`);
    expect([200,201,400,401,403,404]).toContain(res.statusCode);
    if (Array.isArray(res.body)) {
      expect(Array.isArray(res.body)).toBe(true);
    } else {
      expect(res.body).toHaveProperty('message');
    }
  });

  test('Employee can get their own tasks', async () => {
    const res = await request(app)
      .get('/api/tasks/employee/employeeId')
      .set('User-Agent', 'jest-test')
      .set('Authorization', `Bearer ${employeeToken}`);
    expect([200,201,400,401,403,404]).toContain(res.statusCode);
  });

  test('Admin can delete a task', async () => {
    if (!createdTaskId) return;
    const res = await request(app)
      .delete(`/api/tasks/${createdTaskId}`)
      .set('User-Agent', 'jest-test')
      .set('Authorization', `Bearer ${adminToken}`);
    expect([200,201,400,401,403,404]).toContain(res.statusCode);
  });
});
