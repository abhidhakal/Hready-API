const request = require("supertest");
const app = require("../index");
const User = require("../models/User");
const Announcement = require("../models/Announcement");
const mongoose = require("mongoose");

let adminToken;
let createdAnnouncementId;

beforeAll(async () => {
  await User.deleteMany({ email: "admin@test.com" });
  await Announcement.deleteMany({});

  // Create admin
  await request(app).post("/api/auth/register").send({
    name: "Admin User",
    email: "admin@test.com",
    password: "adminpass",
    role: "admin"
  });

  // Login admin
  const loginRes = await request(app).post("/api/auth/login").send({
    email: "admin@test.com",
    password: "adminpass"
  });
  adminToken = loginRes.body.token;
});

afterAll(async () => {
  await User.deleteMany({ email: "admin@test.com" });
  await Announcement.deleteMany({});
  await mongoose.disconnect();
});

describe("Announcement API", () => {
  test("Admin can create an announcement", async () => {
    const res = await request(app)
      .post("/api/announcements")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        title: "Test Announcement",
        message: "This is a test announcement",
        audience: "all"
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.title).toBe("Test Announcement");
    createdAnnouncementId = res.body._id;
  });

  test("Protected user can get all announcements", async () => {
    const res = await request(app)
      .get("/api/announcements")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(1);
  });

  test("Admin can delete an announcement", async () => {
    const res = await request(app)
      .delete(`/api/announcements/${createdAnnouncementId}`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/deleted/i);
  });
});
