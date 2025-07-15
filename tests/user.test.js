const request = require("supertest");
const app = require("../index");
const User = require("../models/User");
const mongoose = require("mongoose");

let adminToken;
let employeeToken;
let createdEmployeeId;

beforeAll(async () => {
  // Clean up
  await User.deleteMany({ email: { $in: ["admin@test.com", "employee@test.com"] } });

  // Create admin user
  const adminRes = await request(app).post("/api/auth/register").send({
    name: "Admin User",
    email: "admin@test.com",
    password: "adminpass",
    role: "admin"
  });
  adminToken = adminRes.body.token;

  // Create employee user
  const employeeRes = await request(app).post("/api/auth/register").send({
    name: "Employee User",
    email: "employee@test.com",
    password: "employeepass",
    role: "employee"
  });
  employeeToken = employeeRes.body.token;
});

afterAll(async () => {
  await User.deleteMany({ email: { $in: ["admin@test.com", "employee@test.com", "newemployee@test.com"] } });
  await mongoose.disconnect();
});

describe("User (Employee) API", () => {
  test("Admin can create a new employee", async () => {
    const res = await request(app)
      .post("/api/employees")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        name: "New Employee",
        email: "newemployee@test.com",
        password: "newpass123",
        role: "employee",
        department: "HR",
        position: "Staff",
        status: "active"
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.email).toBe("newemployee@test.com");
    createdEmployeeId = res.body._id;
  });

  test("Admin can get all employees", async () => {
    const res = await request(app)
      .get("/api/employees")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test("Employee can get their own profile", async () => {
    const res = await request(app)
      .get("/api/employees/me")
      .set("Authorization", `Bearer ${employeeToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.email).toBe("employee@test.com");
  });

  test("Employee can change their password", async () => {
    const res = await request(app)
      .put("/api/employees/change-password")
      .set("Authorization", `Bearer ${employeeToken}`)
      .send({
        currentPassword: "employeepass",
        newPassword: "newemployeePass123"
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Password changed successfully");
  });
});
