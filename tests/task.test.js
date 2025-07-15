const request = require("supertest");
const app = require("../index");
const User = require("../models/User");
const Task = require("../models/Task");
const mongoose = require("mongoose");

let adminToken;
let employeeId;
let createdTaskId;

beforeAll(async () => {
  // Clean up users and tasks
  await User.deleteMany({ email: { $in: ["admin@test.com", "employee@test.com"] } });
  await Task.deleteMany({});

  // Create admin user
  await request(app).post("/api/auth/register").send({
    name: "Admin User",
    email: "admin@test.com",
    password: "adminpass",
    role: "admin"
  });

  // Login admin to get token
  const loginRes = await request(app).post("/api/auth/login").send({
    email: "admin@test.com",
    password: "adminpass"
  });
  adminToken = loginRes.body.token;

  // Create employee user
  const empRes = await request(app).post("/api/auth/register").send({
    name: "Employee User",
    email: "employee@test.com",
    password: "employeepass",
    role: "employee"
  });
  employeeId = empRes.body._id;
});

afterAll(async () => {
  await User.deleteMany({ email: { $in: ["admin@test.com", "employee@test.com"] } });
  await Task.deleteMany({});
  await mongoose.disconnect();
});

describe("Task API", () => {
  test("Admin can create a task", async () => {
    const res = await request(app)
      .post("/api/tasks")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        title: "Test Task",
        description: "This is a test task",
        assignedTo: employeeId,
        dueDate: "2025-12-31"
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.title).toBe("Test Task");
    createdTaskId = res.body._id;
  });

  test("Admin can get all tasks", async () => {
    const res = await request(app)
      .get("/api/tasks")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(1);
  });

  test("Admin can update a task", async () => {
    const res = await request(app)
      .put(`/api/tasks/${createdTaskId}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        status: "In Progress"
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe("In Progress");
  });

  test("Admin can delete a task", async () => {
    const res = await request(app)
      .delete(`/api/tasks/${createdTaskId}`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/deleted/i);
  });
});
