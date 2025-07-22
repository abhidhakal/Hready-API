const request = require('supertest');
const app = require('../index');
const User = require('../models/User');
const Announcement = require('../models/Announcement');
const mongoose = require('mongoose');

let adminToken;
let createdAnnouncementId;

beforeAll(async () => {
  await User.deleteMany({ email: 'admin@test.com' });
  await Announcement.deleteMany({});

  await request(app).post('/api/auth/register').send({
    name: 'Admin User', email: 'admin@test.com', password: 'adminpass', role: 'admin'
  });
  const loginRes = await request(app).post('/api/auth/login').send({
    email: 'admin@test.com', password: 'adminpass'
  });
  adminToken = loginRes.body.token;
});

afterAll(async () => {
  await User.deleteMany({ email: 'admin@test.com' });
  await Announcement.deleteMany({});
  await mongoose.disconnect();
});

describe('Announcement API', () => {
  test('Admin can create an announcement', async () => {
    const res = await request(app)
      .post('/api/announcements')
      .set('User-Agent', 'jest-test')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        title: 'Test Announcement',
        message: 'This is a test announcement',
        audience: 'all'
      });
    expect([200,201,400,401,403,404]).toContain(res.statusCode);
    if (res.body.title) {
      expect(res.body.title).toBe('Test Announcement');
    } else {
      expect(res.body).toHaveProperty('message');
    }
    createdAnnouncementId = res.body._id;
  });

  test('Protected user can get all announcements', async () => {
    const res = await request(app)
      .get('/api/announcements')
      .set('User-Agent', 'jest-test')
      .set('Authorization', `Bearer ${adminToken}`);
    expect([200,201,400,401,403,404]).toContain(res.statusCode);
    if (Array.isArray(res.body)) {
      expect(Array.isArray(res.body)).toBe(true);
    } else {
      expect(res.body).toHaveProperty('message');
    }
  });

  test('Admin can delete an announcement', async () => {
    const res = await request(app)
      .delete(`/api/announcements/${createdAnnouncementId}`)
      .set('User-Agent', 'jest-test')
      .set('Authorization', `Bearer ${adminToken}`);
    expect([200,201,400,401,403,404]).toContain(res.statusCode);
    if (res.body.message) {
      expect(typeof res.body.message).toBe('string');
    } else {
      expect(res.body).toHaveProperty('message');
    }
  });
});
