// @ts-nocheck
/// <reference types="jest" />
// @ts-ignore
import { render, screen } from "@testing-library/react";
import MatchPercentageRing from "./MatchPercentageRing";
import * as matchers from "@testing-library/jest-dom/matchers";

// @ts-ignore
expect.extend(matchers);

describe("MatchPercentageRing", () => {
  it("renders the correct percentage score", () => {
    render(<MatchPercentageRing score={85} />);
    // @ts-ignore
    expect(screen.getByText("85%")).toBeInTheDocument();
  });

  it("renders the 'Excellent' label for high scores", () => {
    render(<MatchPercentageRing score={85} />);
    // @ts-ignore
    expect(screen.getByText("EXCELLENT")).toBeInTheDocument();
  });

  it("renders the 'Good' label for medium scores", () => {
    render(<MatchPercentageRing score={60} />);
    // @ts-ignore
    expect(screen.getByText("GOOD")).toBeInTheDocument();
  });

  it("renders the 'Fair' label for low scores", () => {
    render(<MatchPercentageRing score={30} />);
    // @ts-ignore
    expect(screen.getByText("FAIR")).toBeInTheDocument();
  });
});
