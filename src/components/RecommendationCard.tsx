import { useState } from "react";
import MatchPercentageRing from "./MatchPercentageRing.tsx";
import AIExplanation from "./AIExplanation.tsx";
import { FrontendRecommendation } from "../services/aiService";
import { TranslationContent } from "../data/translations.ts";

interface RecommendationCardProps {
  internship: FrontendRecommendation;
  rank: number;
  t: TranslationContent;
}

type FeedbackState = "up" | "down" | null;

/** POST thumbs feedback to the backend. Fire-and-forget. */
async function postFeedback(id: string, helpful: boolean): Promise<void> {
  try {
    await fetch(`/api/recommendations/${id}/feedback`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ helpful }),
    });
  } catch (err) {
    console.warn("[Feedback] Could not reach backend:", err);
  }
}

export default function RecommendationCard({ internship, rank, t }: RecommendationCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackState>(null);
  const [feedbackSent, setFeedbackSent] = useState(false);

  const handleFeedback = async (helpful: boolean) => {
    if (feedbackSent) return;
    const next: FeedbackState = helpful ? "up" : "down";
    setFeedback(next);
    setFeedbackSent(true);
    await postFeedback(String(internship.id), helpful);
  };

  const rankStyles =
    rank === 1
      ? { background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: 'white', boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)' }
      : rank === 2
      ? { background: 'linear-gradient(135deg, #94a3b8, #64748b)', color: 'white', boxShadow: '0 4px 12px rgba(148, 163, 184, 0.3)' }
      : rank === 3
      ? { background: 'linear-gradient(135deg, #f97316, #ea580c)', color: 'white', boxShadow: '0 4px 12px rgba(249, 115, 22, 0.3)' }
      : { background: '#eef2ff', color: '#4338ca', border: '1px solid #c7d2fe' };

  return (
    <div className="rec-card bg-white rounded-3xl overflow-hidden animate-fadeIn">
      {/* Top section with ring + info */}
      <div className="p-6 sm:p-7">
        <div className="flex items-start gap-5">
          {/* Match Ring */}
          <div className="flex-shrink-0 hidden sm:block">
            <MatchPercentageRing score={internship.score} size={84} strokeWidth={5} />
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span
                className="text-xs font-bold px-3.5 py-1.5 rounded-xl"
                style={rankStyles}
              >
                #{rank}
              </span>
              <h3 className="text-base sm:text-lg font-extrabold text-gray-900 leading-snug tracking-tight">
                {internship.title}
              </h3>
            </div>
            <p className="text-sm text-gray-500 mt-1.5 flex items-center gap-2">
              <span className="text-base">{internship.icon}</span>
              <span className="font-semibold">{internship.company}</span>
            </p>

            {/* Quick info tags */}
            <div className="flex flex-wrap gap-2 mt-3.5">
              {[
                { icon: "📍", text: internship.location },
                { icon: "⏱", text: internship.duration },
                { icon: "💰", text: internship.stipend },
              ].map((tag) => (
                <span key={tag.icon} className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl font-medium text-gray-600" style={{ background: 'rgba(241, 245, 249, 0.8)', border: '1px solid rgba(226, 232, 240, 0.6)' }}>
                  {tag.icon} {tag.text}
                </span>
              ))}
              <span className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl font-medium" style={{ background: 'rgba(238, 242, 255, 0.8)', color: '#4338ca', border: '1px solid rgba(199, 210, 254, 0.6)' }}>
                🏢 {internship.mode}
              </span>
            </div>
          </div>

          {/* Mobile match score */}
          <div className="sm:hidden flex-shrink-0">
            <MatchPercentageRing score={internship.score} size={68} strokeWidth={4} />
          </div>
        </div>

        {/* Required skills preview */}
        {internship.skills && internship.skills.length > 0 && (
          <div className="mt-5 pt-5 border-t border-gray-100/80">
            <p className="text-[11px] text-gray-400 font-bold uppercase tracking-widest mb-2.5">Required Skills</p>
            <div className="flex flex-wrap gap-2">
              {internship.skills.slice(0, 5).map((skill) => (
                <span
                  key={skill}
                  className="text-[11px] px-3 py-1.5 rounded-lg font-semibold"
                  style={{ background: 'linear-gradient(135deg, #eef2ff, #ede9fe)', color: '#4338ca', border: '1px solid #c7d2fe' }}
                >
                  {skill}
                </span>
              ))}
              {internship.skills.length > 5 && (
                <span className="text-[11px] px-3 py-1.5 rounded-lg font-medium" style={{ background: '#f1f5f9', color: '#94a3b8' }}>
                  +{internship.skills.length - 5} more
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* AI Explanation section */}
      <div className="px-6 sm:px-7">
        <AIExplanation
          reasoning={internship.reasoning}
          breakdown={internship.breakdown}
          score={internship.score}
        />
      </div>

      {/* Expandable details */}
      <div className="px-6 sm:px-7 py-5">
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-primary-600 text-sm font-bold hover:text-primary-700 flex items-center gap-2 transition-all duration-300 w-full justify-center py-2.5 rounded-2xl hover:bg-primary-50/60 border border-transparent hover:border-primary-100"
        >
          <svg
            className={`w-4 h-4 transition-transform duration-300 ${expanded ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
          {expanded ? "Hide Details" : t.viewDetails}
        </button>

        {expanded && (
          <div className="mt-4 space-y-4 animate-fadeIn pb-2">
            <p className="text-sm text-gray-600 leading-relaxed">{internship.description}</p>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl" style={{ background: 'rgba(241, 245, 249, 0.6)', border: '1px solid rgba(226, 232, 240, 0.5)' }}>
                <span className="text-gray-400 block text-[10px] uppercase tracking-widest font-bold">{t.sector}</span>
                <span className="font-semibold text-gray-700 mt-1 block">{internship.sector}</span>
              </div>
              <div className="p-3 rounded-xl" style={{ background: 'rgba(241, 245, 249, 0.6)', border: '1px solid rgba(226, 232, 240, 0.5)' }}>
                <span className="text-gray-400 block text-[10px] uppercase tracking-widest font-bold">{t.company}</span>
                <span className="font-semibold text-gray-700 mt-1 block">{internship.company}</span>
              </div>
            </div>

            {/* All required skills */}
            {internship.skills && internship.skills.length > 5 && (
              <div>
                <p className="text-xs font-bold text-gray-500 mb-2">All Required Skills</p>
                <div className="flex flex-wrap gap-2">
                  {internship.skills.map((skill) => (
                    <span
                      key={skill}
                      className="text-[11px] px-2.5 py-1 rounded-lg font-medium"
                      style={{ background: '#eef2ff', color: '#4338ca', border: '1px solid #c7d2fe' }}
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Thumbs Feedback Bar ── */}
      <div
        className="px-6 sm:px-7 py-4 border-t border-gray-100/80 flex items-center justify-between"
        style={{ background: 'rgba(248, 250, 252, 0.6)' }}
      >
        <span className="text-xs text-gray-400 font-semibold">
          {feedbackSent ? "Thanks for your feedback!" : "Was this helpful?"}
        </span>

        <div className="flex items-center gap-2">
          <button
            id={`feedback-up-${internship.id}`}
            onClick={() => handleFeedback(true)}
            disabled={feedbackSent}
            title="Helpful"
            className={`w-9 h-9 rounded-xl flex items-center justify-center text-base transition-all duration-200 font-medium
              ${feedback === "up"
                ? "bg-emerald-100 text-emerald-600 scale-110 shadow-sm"
                : "bg-gray-100 text-gray-400 hover:bg-emerald-50 hover:text-emerald-500 hover:scale-105"}
              ${feedbackSent ? "cursor-default opacity-70" : "cursor-pointer"}`}
          >
            👍
          </button>
          <button
            id={`feedback-down-${internship.id}`}
            onClick={() => handleFeedback(false)}
            disabled={feedbackSent}
            title="Not helpful"
            className={`w-9 h-9 rounded-xl flex items-center justify-center text-base transition-all duration-200 font-medium
              ${feedback === "down"
                ? "bg-red-100 text-red-500 scale-110 shadow-sm"
                : "bg-gray-100 text-gray-400 hover:bg-red-50 hover:text-red-400 hover:scale-105"}
              ${feedbackSent ? "cursor-default opacity-70" : "cursor-pointer"}`}
          >
            👎
          </button>
        </div>
      </div>
    </div>
  );
}
