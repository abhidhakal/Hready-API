const request = require("supertest");
const app = require("../index");
const User = require("../models/User");
const mongoose = require("mongoose");

beforeAll(async () => {
  // Make sure the test user exists
  await User.deleteOne({ email: "testuser@example.com" });

  await request(app).post("/api/auth/register").send({
    name: "Test User",
    email: "testuser@example.com",
    password: "password123",
    role: "employee"
  });
});

afterAll(async () => {
  await User.deleteOne({ email: "testuser@example.com" });
  await mongoose.disconnect();
});

describe("Extra Auth/User Edge Cases", () => {
  test("should not allow duplicate registration", async () => {
    const res = await request(app).post("/api/auth/register").send({
      name: "Test User",
      email: "testuser@example.com",
      password: "password123",
      role: "employee"
    });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/already exists/i);
  });

  test("should fail login with unregistered email", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: "nosuchuser@example.com",
      password: "somepassword"
    });

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toMatch(/invalid credentials/i);
  });

  test("should deny access to protected route without token", async () => {
    const res = await request(app).get("/api/employees/me");

    expect(res.statusCode).toBe(403);
    expect(res.body.message).toMatch(/no token/i);
  });
});
