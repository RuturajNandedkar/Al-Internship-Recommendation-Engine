// @ts-nocheck
import React from "react";
import { describe, it, expect, jest } from "@jest/globals";
// @ts-ignore
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import RecommendationCard from "./RecommendationCard";
import { translations } from "../data/translations";
import * as matchers from "@testing-library/jest-dom/matchers";

// @ts-ignore
expect.extend(matchers);

// Mock child components to isolate RecommendationCard
jest.mock("./MatchPercentageRing", () => ({
  __esModule: true,
  default: ({ score }: { score: number }) => <div data-testid="match-ring">{score}%</div>,
}));

jest.mock("./AIExplanation", () => ({
  __esModule: true,
  default: () => <div data-testid="ai-explanation">AI Insight</div>,
}));

describe("RecommendationCard", () => {
  const mockInternship = {
    _id: "1",
    title: "Software Intern",
    company: "Google",
    location: "Remote",
    domain: "AI",
    required_skills: ["Python", "JavaScript"],
    stipend: "$2000",
    duration: "3 months",
    application_link: "http://example.com",
    description: "Build great things",
    score: 85,
    icon: "🚀",
    mode: "Remote",
    sector: "Technology",
    reasoning: "Good match",
    breakdown: {
      skills: 80,
      field: 90,
      sector: 85,
      location: 100,
      experience: 80,
    },
    matchedSkills: ["Python"],
    missingSkills: ["JavaScript"],
  };

  const t = translations.en;

  it("renders essential internship information", () => {
    render(<RecommendationCard internship={mockInternship as any} rank={1} t={t} />);
    
    // @ts-ignore
    expect(screen.getByText("Software Intern")).toBeInTheDocument();
    // @ts-ignore
    expect(screen.getByText("Google")).toBeInTheDocument();
    // @ts-ignore
    expect(screen.getByText("$2000")).toBeInTheDocument();
    // @ts-ignore
    expect(screen.getByText("Remote")).toBeInTheDocument();
  });

  it("displays the correct rank", () => {
    render(<RecommendationCard internship={mockInternship as any} rank={1} t={t} />);
    // @ts-ignore
    expect(screen.getByText("#1")).toBeInTheDocument();
  });

  it("toggles expanded details when the button is clicked", () => {
    render(<RecommendationCard internship={mockInternship as any} rank={1} t={t} />);
    
    // @ts-ignore
    const viewDetailsBtn = screen.getByText(t.viewDetails);
    fireEvent.click(viewDetailsBtn);
    
    // @ts-ignore
    expect(screen.getByText("Build great things")).toBeInTheDocument();
    // @ts-ignore
    expect(screen.getByText("Hide Details")).toBeInTheDocument();
    
    // @ts-ignore
    fireEvent.click(screen.getByText("Hide Details"));
    // @ts-ignore
    expect(screen.queryByText("Build great things")).not.toBeInTheDocument();
  });

  it("renders the MatchPercentageRing with the correct score", () => {
    render(<RecommendationCard internship={mockInternship as any} rank={1} t={t} />);
    // @ts-ignore
    expect(screen.getAllByTestId("match-ring")[0]).toHaveTextContent("85%");
  });
});
