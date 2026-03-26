// @ts-ignore
import { describe, it, expect, beforeAll, afterAll, afterEach, beforeEach } from "@jest/globals";
// @ts-ignore
import request from "supertest";
import app from "../server";
import { connect, closeDatabase, clearDatabase } from "./dbHandler";
import User from "../models/User";

beforeAll(async () => await connect());
afterEach(async () => await clearDatabase());
afterAll(async () => await closeDatabase());

describe("Auth Integration Tests", () => {
  const userData = {
    name: "Test User",
    email: "test@example.com",
    password: "Password123",
  };

  describe("POST /api/auth/signup", () => {
    it("should register a new user successfully", async () => {
      const res = await request(app)
        .post("/api/auth/signup")
        .send(userData);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe(userData.email);
      expect(res.body.data.token).toBeDefined();

      const user = await User.findOne({ email: userData.email });
      expect(user).toBeTruthy();
    });

    it("should fail with invalid data", async () => {
      const res = await request(app)
        .post("/api/auth/signup")
        .send({ name: "", email: "not-an-email" });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe("POST /api/auth/login", () => {
    beforeEach(async () => {
      await request(app).post("/api/auth/signup").send(userData);
    });

    it("should login successfully with correct credentials", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({
          email: userData.email,
          password: userData.password,
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBeDefined();
    });

    it("should fail with incorrect password", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({
          email: userData.email,
          password: "wrongpassword",
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });
});
