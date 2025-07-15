const request = require("supertest");
const path = require("path");
const app = require("../index");
const User = require("../models/User");
const Leave = require("../models/Leave");
const mongoose = require("mongoose");

let adminToken;
let employeeToken;
let createdLeaveId;

beforeAll(async () => {
  await User.deleteMany({ email: { $in: ["admin@test.com", "employee@test.com"] } });
  await Leave.deleteMany({});

  await request(app).post("/api/auth/register").send({
    name: "Admin User",
    email: "admin@test.com",
    password: "adminpass",
    role: "admin"
  });

  const adminLogin = await request(app).post("/api/auth/login").send({
    email: "admin@test.com",
    password: "adminpass"
  });
  adminToken = adminLogin.body.token;

  await request(app).post("/api/auth/register").send({
    name: "Employee User",
    email: "employee@test.com",
    password: "employeepass",
    role: "employee"
  });

  const empLogin = await request(app).post("/api/auth/login").send({
    email: "employee@test.com",
    password: "employeepass"
  });
  employeeToken = empLogin.body.token;
});

afterAll(async () => {
  await User.deleteMany({ email: { $in: ["admin@test.com", "employee@test.com"] } });
  await Leave.deleteMany({});
  await mongoose.disconnect();
});

describe("Leave API", () => {
  test("Employee can create a leave request", async () => {
    const res = await request(app)
      .post("/api/leaves")
      .set("Authorization", `Bearer ${employeeToken}`)
      .field("leaveType", "Sick")
      .field("startDate", "2025-07-20")
      .field("endDate", "2025-07-22")
      .field("reason", "Not feeling well")
      .field("halfDay", "false")
      .attach("attachment", path.join(__dirname, "dummy.txt"));

    console.log("DEBUG RESPONSE BODY:", res.body);

    expect(res.statusCode).toBe(201);
    expect(res.body.leave.leaveType).toBe("Sick");
    createdLeaveId = res.body.leave._id;
  });

  test("Employee can get their own leaves", async () => {
    const res = await request(app)
      .get("/api/leaves")
      .set("Authorization", `Bearer ${employeeToken}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(1);
  });

  test("Admin can get all leaves", async () => {
    const res = await request(app)
      .get("/api/leaves/all")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test("Admin can update leave status", async () => {
    const res = await request(app)
      .put(`/api/leaves/${createdLeaveId}/status`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        status: "Approved",
        adminComment: "Get well soon"
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.leave.status).toBe("Approved");
  });
});
