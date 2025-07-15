const request = require("supertest");
const app = require("../index");
const User = require("../models/User");
const mongoose = require("mongoose");

let authToken;

afterAll(async () => {
  // Clean up the test user
  await User.deleteOne({ email: "testuser@example.com" });
  await mongoose.disconnect();
});

describe("Auth API", () => {
  beforeAll(async () => {
    // Ensure no duplicate user
    await User.deleteOne({ email: "testuser@example.com" });
  });

  test("should return 400 if missing fields on register", async () => {
    const res = await request(app).post("/api/auth/register").send({
      email: "testuser@example.com",
      password: "password123"
    });
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("Please provide all fields");
  });

  test("should register a user with all fields", async () => {
    const res = await request(app).post("/api/auth/register").send({
      name: "Test User",
      email: "testuser@example.com",
      password: "password123",
      role: "employee"
    });
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("token");
    expect(res.body.email).toBe("testuser@example.com");
  });

  test("should login with correct credentials", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: "testuser@example.com",
      password: "password123"
    });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("token");
    authToken = res.body.token;
  });

  test("should fail login with wrong password", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: "testuser@example.com",
      password: "wrongpassword"
    });
    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe("Invalid credentials");
  });
});
