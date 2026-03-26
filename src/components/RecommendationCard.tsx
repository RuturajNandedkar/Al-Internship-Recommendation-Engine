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

export default function RecommendationCard({ internship, rank, t }: RecommendationCardProps) {
  const [isSaved, setIsSaved] = useState(false);

  // Helper to get initials or first letter
  const getLogoLetter = (name: string) => name.charAt(0).toUpperCase();

  return (
    <div className="reveal group relative bg-[#12121c] border border-white/5 rounded-[16px] p-7 transition-all duration-300 hover:-translate-y-1 hover:border-white/10 hover:shadow-[0_20px_60px_rgba(0,0,0,0.4)] overflow-hidden">
      {/* Top Gradient Border (Animated on Hover) */}
      <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-accent to-[#38bdf8] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      {/* Card Header */}
      <div className="flex justify-between items-start mb-6">
        <div className="flex gap-4 items-center">
          {/* Company Logo Placeholder */}
          <div className="w-[48px] h-[48px] rounded-[12px] bg-surface2 flex items-center justify-center border border-white/5 font-display font-bold text-lg text-accent">
            {getLogoLetter(internship.company)}
          </div>
          <div>
            <h3 className="font-display font-bold text-[17px] text-white leading-none tracking-tight">
              {internship.title}
            </h3>
            <p className="text-[13px] text-[#9898b0] mt-1.5 flex items-center gap-2">
              <span>{internship.company}</span>
              <span className="w-1 h-1 rounded-full bg-white/10" />
              <span>{internship.location}</span>
            </p>
          </div>
        </div>

        {/* Score Ring (Top Right) */}
        <div className="flex-shrink-0">
          <MatchPercentageRing score={internship.score} />
        </div>
      </div>

      {/* Meta Pills */}
      <div className="flex flex-wrap gap-2 mb-6">
        {[
          { icon: "📍", text: internship.location },
          { icon: "💰", text: internship.stipend },
          { icon: "⏱", text: internship.duration },
        ].map((tag, i) => (
          <span 
            key={i} 
            className="px-3 py-1.5 rounded-full bg-surface2 text-[11px] font-medium text-white/60 border border-white/5"
          >
            {tag.text}
          </span>
        ))}
      </div>

      {/* Skills Section */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          {internship.skills?.map((skill, i) => {
            const isMatched = i < 3; // Placeholder logic for matched skills
            return (
              <span 
                key={skill}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-colors
                  ${isMatched 
                    ? "bg-accent/10 text-accent2 border border-accent/20" 
                    : "bg-white/[0.03] text-white/30 border border-white/5"}
                `}
              >
                {skill}
              </span>
            );
          })}
        </div>
      </div>

      {/* AI Insight Box */}
      <div className="mb-8">
        <AIExplanation
          reasoning={internship.reasoning}
          breakdown={internship.breakdown}
          score={internship.score}
        />
      </div>

      {/* Action Buttons Row */}
      <div className="flex items-center gap-3">
        <button 
          className="flex-1 py-3 rounded-[8px] bg-accent text-white font-body font-bold text-[13px] hover:bg-accent/90 transition-all shadow-lg shadow-accent/20 uppercase tracking-wider"
          onClick={() => window.open(internship.application_link || '#', '_blank')}
        >
          Apply Now
        </button>
        <button 
          className={`flex-1 py-3 rounded-[8px] border font-body font-bold text-[13px] transition-all relative overflow-hidden uppercase tracking-wider
            ${isSaved ? "bg-accent/10 border-accent/30 text-accent btn-save-animate" : "border-white/10 text-[#9898b0] hover:bg-white/5"}
          `}
          onClick={() => setIsSaved(!isSaved)}
        >
          <div className="flex items-center justify-center gap-2">
            <svg 
              className={`w-3.5 h-3.5 transition-colors ${isSaved ? "fill-accent text-accent" : "text-[#9898b0]"}`} 
              fill={isSaved ? "currentColor" : "none"} 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
            <span>{isSaved ? "Saved" : "Save"}</span>
          </div>
        </button>
        <button 
          className="flex-1 py-3 rounded-[8px] border border-white/10 text-[#9898b0] font-body font-bold text-[13px] hover:bg-white/5 transition-all uppercase tracking-wider"
          onClick={() => console.log('Gap Analysis')}
        >
          Analysis
        </button>
      </div>
    </div>
  );
}
