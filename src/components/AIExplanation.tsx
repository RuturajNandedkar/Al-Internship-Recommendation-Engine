import { useState } from "react";
import { BreakdownScores } from "../services/aiService.ts";

interface AIExplanationProps {
  reasoning: string;
  breakdown: BreakdownScores;
  score: number;
}

export default function AIExplanation({ reasoning, breakdown, score }: AIExplanationProps) {
  const [expanded, setExpanded] = useState(false);

  if (!reasoning) return null;

  const confidence =
    score >= 70 ? "High" : score >= 45 ? "Medium" : "Low";
  const confidenceStyle =
    score >= 70
      ? { background: 'linear-gradient(135deg, #dcfce7, #bbf7d0)', color: '#15803d', border: '1px solid #86efac' }
      : score >= 45
      ? { background: 'linear-gradient(135deg, #fef9c3, #fde68a)', color: '#a16207', border: '1px solid #fcd34d' }
      : { background: 'linear-gradient(135deg, #ffedd5, #fed7aa)', color: '#c2410c', border: '1px solid #fdba74' };

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: 'linear-gradient(135deg, rgba(238,242,255,0.8), rgba(237,233,254,0.8), rgba(219,234,254,0.8))', border: '1px solid rgba(199, 210, 254, 0.5)', backdropFilter: 'blur(8px)' }}>
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-indigo-50/30 transition-all duration-300"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg" style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)', boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)' }}>
            <span className="text-white text-base">🤖</span>
          </div>
          <div className="text-left">
            <p className="text-sm font-extrabold text-indigo-900">AI Recommendation Insight</p>
            <p className="text-[11px] text-indigo-400 font-medium">Why this internship was recommended</p>
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg" style={confidenceStyle}>
            {confidence} Confidence
          </span>
          <svg
            className={`w-4 h-4 text-indigo-400 transition-transform duration-300 ${expanded ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {/* Reasoning */}
      <div className={`px-6 pb-5 ${expanded ? "" : "hidden"}`}>
        <div className="rounded-xl p-4 mb-5" style={{ background: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.5)', backdropFilter: 'blur(4px)' }}>
          <p className="text-sm text-indigo-800 leading-relaxed">{reasoning}</p>
        </div>

        {/* Factor breakdown */}
        {breakdown && (
          <div className="space-y-2.5">
            <p className="text-xs font-bold text-indigo-600 uppercase tracking-widest">
              Match Factor Breakdown
            </p>
            {[
              { label: "Skills Match", value: breakdown.skills, icon: "⚡" },
              { label: "Field Alignment", value: breakdown.field, icon: "🎓" },
              { label: "Sector Fit", value: breakdown.sector, icon: "🏢" },
              { label: "Location", value: breakdown.location, icon: "📍" },
              { label: "Experience Fit", value: breakdown.experience || 0, icon: "📈" },
              ...(breakdown.growth ? [{ label: "Growth Potential", value: breakdown.growth, icon: "🚀" }] : []),
              ...(breakdown.mode && !breakdown.growth ? [{ label: "Work Mode", value: breakdown.mode, icon: "💻" }] : []),
            ].map(({ label, value, icon }) => (
              <div key={label} className="flex items-center gap-2.5">
                <span className="text-xs w-5 text-center">{icon}</span>
                <span className="text-xs font-semibold text-indigo-700 w-28">{label}</span>
                <div className="flex-1 rounded-full h-2.5 overflow-hidden" style={{ background: 'rgba(199, 210, 254, 0.4)' }}>
                  <div
                    className="h-2.5 rounded-full transition-all duration-700 ease-out"
                    style={{
                      width: `${value}%`,
                      background:
                        value >= 70
                          ? "linear-gradient(90deg, #4f46e5, #7c3aed)"
                          : value >= 45
                          ? "linear-gradient(90deg, #7c3aed, #a78bfa)"
                          : "linear-gradient(90deg, #a78bfa, #c4b5fd)",
                    }}
                  />
                </div>
                <span className="text-xs font-bold text-indigo-700 w-8 text-right">
                  {value}%
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Collapsed preview */}
      {!expanded && (
        <div className="px-6 pb-4">
          <p className="text-xs text-indigo-500 leading-relaxed line-clamp-2 font-medium">{reasoning}</p>
        </div>
      )}
    </div>
  );
}
