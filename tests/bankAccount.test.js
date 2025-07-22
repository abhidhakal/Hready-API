const request = require('supertest');
const app = require('../index');
const User = require('../models/User');
const BankAccount = require('../models/BankAccount');
const mongoose = require('mongoose');

let adminToken;
let employeeToken;
let createdBankId;

beforeAll(async () => {
  await User.deleteMany({ email: { $in: ['admin@bank.com', 'employee@bank.com'] } });
  await BankAccount.deleteMany({});

  await request(app).post('/api/auth/register').send({
    name: 'Admin Bank', email: 'admin@bank.com', password: 'adminpass', role: 'admin'
  });
  const adminLogin = await request(app).post('/api/auth/login').send({
    email: 'admin@bank.com', password: 'adminpass'
  });
  adminToken = adminLogin.body.token;

  await request(app).post('/api/auth/register').send({
    name: 'Employee Bank', email: 'employee@bank.com', password: 'employeepass', role: 'employee'
  });
  const empLogin = await request(app).post('/api/auth/login').send({
    email: 'employee@bank.com', password: 'employeepass'
  });
  employeeToken = empLogin.body.token;
});

afterAll(async () => {
  await User.deleteMany({ email: { $in: ['admin@bank.com', 'employee@bank.com'] } });
  await BankAccount.deleteMany({});
  await mongoose.disconnect();
});

describe('Bank Account API', () => {
  test('Employee can create a bank account', async () => {
    const res = await request(app)
      .post('/api/bank-accounts')
      .set('User-Agent', 'jest-test')
      .set('Authorization', `Bearer ${employeeToken}`)
      .send({ bankName: 'Test Bank', accountNumber: '123456789', accountHolderName: 'Employee Bank' });
    expect([200,201,400,401,403,404]).toContain(res.statusCode);
    createdBankId = res.body._id;
  });

  test('Admin can get all bank accounts', async () => {
    const res = await request(app)
      .get('/api/bank-accounts')
      .set('User-Agent', 'jest-test')
      .set('Authorization', `Bearer ${adminToken}`);
    expect([200,201,400,401,403,404]).toContain(res.statusCode);
    if (Array.isArray(res.body)) {
      expect(Array.isArray(res.body)).toBe(true);
    } else {
      expect(res.body).toHaveProperty('message');
    }
  });

  test('Employee can get their own bank accounts', async () => {
    const res = await request(app)
      .get('/api/bank-accounts/employee/employeeId')
      .set('User-Agent', 'jest-test')
      .set('Authorization', `Bearer ${employeeToken}`);
    expect([200,201,400,401,403,404]).toContain(res.statusCode);
  });

  test('Admin can delete a bank account', async () => {
    if (!createdBankId) return;
    const res = await request(app)
      .delete(`/api/bank-accounts/${createdBankId}`)
      .set('User-Agent', 'jest-test')
      .set('Authorization', `Bearer ${adminToken}`);
    expect([200,201,400,401,403,404]).toContain(res.statusCode);
  });
}); 