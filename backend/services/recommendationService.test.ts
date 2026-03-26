// @ts-nocheck
import { describe, it, expect, jest } from "@jest/globals";
import { buildIDF, cosineSim, computeSkillScore, getRecommendations } from "./recommendationService";
import Internship from "../models/Internship";

// Mock Internship model
// @ts-ignore
jest.mock("../models/Internship", () => ({
  find: jest.fn(),
}));

describe("recommendationService unit tests", () => {
  describe("buildIDF", () => {
    it("should calculate correct IDF values", () => {
      const internships = [
        { required_skills: ["javascript", "react"] },
        { required_skills: ["javascript", "node"] },
        { required_skills: ["python"] },
      ];
      const idf = buildIDF(internships);
      
      // javascript appears in 2/3 docs
      // idf = ln(3/2) + 1 ≈ 0.405 + 1 = 1.405
      expect(idf["javascript"]).toBeCloseTo(1.405, 3);
      
      // python appears in 1/3 docs
      // idf = ln(3/1) + 1 ≈ 1.098 + 1 = 2.098
      expect(idf["python"]).toBeCloseTo(2.098, 3);
    });

    it("should handle empty or undefined skills", () => {
      const internships = [
        { required_skills: ["javascript"] },
        { required_skills: undefined },
        { },
      ];
      const idf = buildIDF(internships as any);
      expect(idf["javascript"]).toBeDefined();
    });
  });

  describe("cosineSim", () => {
    it("should return 1 for identical vectors", () => {
      const vec = { a: 1, b: 2 };
      expect(cosineSim(vec, vec)).toBeCloseTo(1, 5);
    });

    it("should return 0 for orthogonal vectors", () => {
      const vecA = { a: 1, b: 0 };
      const vecB = { a: 0, b: 1 };
      expect(cosineSim(vecA, vecB)).toBe(0);
    });

    it("should return correct similarity for different vectors", () => {
      const vecA = { a: 1, b: 1 };
      const vecB = { a: 1, b: 0 };
      // dot = 1*1 + 1*0 = 1
      // magA = sqrt(1^2 + 1^2) = sqrt(2)
      // magB = sqrt(1^2 + 0^2) = 1
      // sim = 1 / sqrt(2) ≈ 0.707
      expect(cosineSim(vecA, vecB)).toBeCloseTo(0.7071, 4);
    });

    it("should handle empty vectors", () => {
      expect(cosineSim({}, {})).toBe(0);
    });
  });

  describe("computeSkillScore", () => {
    const idf = { javascript: 1.5, react: 2.0, node: 2.0 };

    it("should return 0 if user has no skills", () => {
      expect(computeSkillScore([], ["javascript"], idf)).toBe(0);
    });

    it("should return 0 if internship has no required skills", () => {
      expect(computeSkillScore(["javascript"], [], idf)).toBe(0);
    });

    it("should return high score for perfect match", () => {
      const score = computeSkillScore(["javascript", "react"], ["javascript", "react"], idf);
      expect(score).toBeGreaterThan(0.8);
    });

    it("should handle skill synonyms", () => {
      const scoreNormal = computeSkillScore(["javascript"], ["javascript"], idf);
      const scoreSynonym = computeSkillScore(["js"], ["javascript"], idf);
      expect(scoreSynonym).toBe(scoreNormal);
    });
  });

  describe("getRecommendations", () => {
    const mockInternships = [
      {
        _id: "1",
        title: "Frontend Intern",
        company: "Tech Co",
        domain: "Web Development",
        required_skills: ["javascript", "react"],
        location: "Remote",
        createdAt: new Date().toISOString(),
      },
      {
        _id: "2",
        title: "Backend Intern",
        company: "Code Inc",
        domain: "Web Development",
        required_skills: ["node", "express"],
        location: "New York",
        createdAt: new Date().toISOString(),
      },
    ];

    it("should return sorted recommendations", async () => {
      // @ts-ignore
      (Internship.find as any).mockReturnValue({
        lean: jest.fn().mockResolvedValue(mockInternships),
      });

      const profile = {
        skills: ["javascript", "react"],
        interests: ["web"],
        preferred_domain: "Web Development",
        experience_level: "beginner",
        location: "Remote",
      };

      const results = await getRecommendations(profile);
      
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].title).toBe("Frontend Intern");
      expect(results[0].score).toBeGreaterThan(results[1].score);
    });
  });
});
