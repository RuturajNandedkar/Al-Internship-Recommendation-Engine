// @ts-nocheck
import { describe, it, expect } from "@jest/globals";
import { generateRuleBasedAnalysis, analyzeSkillGaps } from "./skillGapService";

describe("skillGapService unit tests", () => {
  describe("generateRuleBasedAnalysis", () => {
    it("should identify correct skill gaps for Web Development", () => {
      const skills = ["HTML", "CSS"];
      const interests = ["Web"];
      const domain = "Web Development";
      
      const result = generateRuleBasedAnalysis(skills, interests, "beginner", domain);
      
      expect(result.readiness_score).toBeLessThan(100);
      expect(result.skill_gaps.some(gap => gap.skill === "JavaScript")).toBe(true);
      expect(result.current_strengths.some(s => s.skill === "HTML")).toBe(true);
    });

    it("should handle empty skills list", () => {
      const result = generateRuleBasedAnalysis([], [], "beginner", "AI");
      expect(result.readiness_score).toBe(0);
      expect(result.skill_gaps.length).toBeGreaterThan(0);
    });
  });

  describe("analyzeSkillGaps", () => {
    it("should fall back to rule-based analysis when OpenAI is not configured", async () => {
      const profile = {
        skills: ["Python"],
        interests: ["AI"],
        experience_level: "beginner",
        preferred_domain: "AI",
      };
      
      // Ensure OPENAI_API_KEY is not set or mock the service to fail
      const result = await analyzeSkillGaps(profile);
      
      expect(result.source).toBe("rule-based");
      expect(result.readiness_score).toBeDefined();
    });
  });
});
