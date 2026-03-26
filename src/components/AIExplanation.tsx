import { BreakdownScores } from "../services/aiService.ts";

interface AIExplanationProps {
  reasoning: string;
  breakdown: BreakdownScores;
  score: number;
}

export default function AIExplanation({ reasoning }: AIExplanationProps) {
  if (!reasoning) return null;

  return (
    <div className="bg-[#38bdf8]/[0.04] border border-[#38bdf8]/[0.12] rounded-[10px] p-[14px] flex gap-3 animate-fadeIn">
      <div className="flex-shrink-0 mt-0.5">
        <span className="text-[#38bdf8] text-base">✦</span>
      </div>
      <p className="text-[13px] text-[#9898b0] leading-[1.6]">
        {reasoning}
      </p>
    </div>
  );
}
