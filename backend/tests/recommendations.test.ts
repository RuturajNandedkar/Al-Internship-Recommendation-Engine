// @ts-ignore
import { describe, it, expect, beforeAll, afterAll, afterEach, beforeEach, jest } from "@jest/globals";
// @ts-ignore
import request from "supertest";
import app from "../server";
import { connect, closeDatabase, clearDatabase } from "./dbHandler";
import Internship from "../models/Internship";

// Mock geminiService to ensure we only test algorithmic scoring
// @ts-ignore
jest.mock("../services/geminiService", () => ({
  isGeminiAvailable: jest.fn().mockReturnValue(false),
  // @ts-ignore
  enhanceWithAI: jest.fn().mockResolvedValue(null),
}));


beforeAll(async () => await connect());
afterEach(async () => await clearDatabase());
afterAll(async () => await closeDatabase());

describe("Recommendations Integration Tests", () => {
  beforeEach(async () => {
    await Internship.create({
      title: "Software Engineer Intern",
      company: "Test Co",
      location: "Remote",
      domain: "Web Development",
      required_skills: ["JavaScript", "React"],
      stipend: "$1000",
      duration: "3 months",
      application_link: "http://example.com",
      description: "Learn to build web apps",
    });
  });

  it("should return recommendations for a user profile", async () => {
    const profile = {
      skills: ["JavaScript"],
      interests: ["Web Development"],
      preferred_domain: "Web Development",
      experience_level: "beginner",
      location: "Remote",
    };

    const res = await request(app)
      .post("/api/recommendations")
      .send(profile);

    console.log("DEBUG: recommendations res.body:", JSON.stringify(res.body, null, 2));

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(res.body.data[0].title).toContain("Software Engineer");
  });
});
