// @ts-nocheck
import { describe, it, expect, beforeAll, afterAll, afterEach, beforeEach, jest } from "@jest/globals";
// @ts-ignore
import request from "supertest";
import app from "../server";
import { connect, closeDatabase, clearDatabase } from "./dbHandler";
import Internship from "../models/Internship";
import pdfParse from "pdf-parse";
import { enhanceWithAI } from "../services/geminiService";

// Mock pdf-parse
jest.mock("pdf-parse");
const mockedPdfParse = pdfParse as unknown as jest.Mock;

// Mock geminiService
jest.mock("../services/geminiService", () => ({
  isGeminiAvailable: jest.fn(() => false),
  enhanceWithAI: jest.fn(() => Promise.resolve(null as any)),
}));

const mockedEnhanceWithAI = enhanceWithAI as unknown as jest.Mock;


beforeAll(async () => await connect());
afterEach(async () => await clearDatabase());
afterAll(async () => await closeDatabase());

describe("Resume Integration Tests", () => {
  const userData = {
    name: "Resume User",
    email: "resume@example.com",
    password: "Password123",
  };

  let token: string;

  beforeEach(async () => {
    // Register and login to get token
    await request(app).post("/api/auth/signup").send(userData);
    const loginRes = await request(app).post("/api/auth/login").send({
      email: userData.email,
      password: userData.password,
    });
    token = loginRes.body.data.token;

    // Create a mock internship
    await Internship.create({
      title: "React Developer Intern",
      company: "Web Tech",
      location: "Remote",
      domain: "Web Development",
      required_skills: ["React", "JavaScript"],
      stipend: "$500",
      duration: "2 months",
      application_link: "http://example.com",
      description: "Build UI components",
    });
  });

  describe("POST /api/resume/upload", () => {
    it("should parse resume and return recommendations", async () => {
      // @ts-ignore
      mockedPdfParse.mockResolvedValue({
        text: "I am a skilled developer with experience in React and JavaScript. I love web development.",
      });

      const res = await request(app)
        .post("/api/resume/upload")
        .set("Authorization", `Bearer ${token}`)
        .attach("resume", Buffer.from("dummy pdf content"), "resume.pdf");

      expect(res.status).toBe(202);
      expect(res.body.success).toBe(true);
      expect(res.body.data.jobId).toBeDefined();
    });

    it("should fail without a token", async () => {
      const res = await request(app)
        .post("/api/resume/upload")
        .attach("resume", Buffer.from("dummy pdf content"), "resume.pdf");

      expect(res.status).toBe(401);
    });
  });
});
