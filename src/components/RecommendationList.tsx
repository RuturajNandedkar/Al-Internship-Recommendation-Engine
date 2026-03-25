import RecommendationCard from "./RecommendationCard.tsx";
import SkillGapSuggestions from "./SkillGapSuggestions.tsx";
import LearningResources from "./LearningResources.tsx";
import { FrontendRecommendation } from "../services/aiService";
import { TranslationContent } from "../data/translations.ts";

interface RecommendationListProps {
  results: FrontendRecommendation[];
  t: TranslationContent;
  onReset: () => void;
  aiUsed: boolean;
  userSkills: string[];
}

export default function RecommendationList({ results, t, onReset, aiUsed, userSkills }: RecommendationListProps) {
  if (!results || results.length === 0) {
    return (
      <div className="text-center py-20 animate-fadeIn">
        <div className="w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-6" style={{ background: 'linear-gradient(135deg, #eef2ff, #ede9fe)' }}>
          <span className="text-5xl">🔍</span>
        </div>
        <p className="text-gray-500 text-lg mb-8 font-semibold">{t.noResults}</p>
        <button
          onClick={onReset}
          className="btn-primary px-10 py-4 rounded-2xl text-base"
        >
          {t.tryAgain}
        </button>
      </div>
    );
  }

  // Summary stats
  const avgScore = Math.round(results.reduce((sum, r) => sum + r.score, 0) / results.length);
  const topScore = results.length > 0 ? results[0].score : 0;
  const sectors = [...new Set(results.map((r) => r.sector))];

  return (
    <div className="space-y-10 animate-fadeIn">
      {/* Results header */}
      <div className="text-center">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">{t.yourRecommendations}</h2>
        <p className="text-sm text-gray-500 mt-2.5">{t.resultsSummary}</p>
        {aiUsed && (
          <span className="inline-flex items-center gap-2 mt-4 text-xs font-bold px-5 py-2 rounded-full shadow-sm" style={{ background: 'linear-gradient(135deg, #eef2ff, #ede9fe)', color: '#4338ca', border: '1px solid #c7d2fe' }}>
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
            🤖 {t.aiGenerated}
          </span>
        )}
      </div>

      {/* Quick Stats Dashboard */}
      <div className="grid grid-cols-3 gap-4 sm:gap-5">
        <div className="stat-card text-center py-6">
          <div className="text-2xl sm:text-3xl font-extrabold text-gradient">{topScore}%</div>
          <div className="text-xs text-gray-400 mt-1.5 font-bold uppercase tracking-wider">Best Match</div>
        </div>
        <div className="stat-card text-center py-6">
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600">{avgScore}%</div>
          <div className="text-xs text-gray-400 mt-1.5 font-bold uppercase tracking-wider">Avg Match</div>
        </div>
        <div className="stat-card text-center py-6">
          <div className="text-2xl sm:text-3xl font-extrabold text-amber-600">{results.length}</div>
          <div className="text-xs text-gray-400 mt-1.5 font-bold uppercase tracking-wider">Internships</div>
        </div>
      </div>

      {/* Sector summary */}
      <div className="flex flex-wrap items-center justify-center gap-2.5">
        <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Sectors:</span>
        {sectors.map((sector) => (
          <span
            key={sector}
            className="text-xs px-3.5 py-1.5 rounded-xl font-semibold"
            style={{ background: 'linear-gradient(135deg, #eef2ff, #ede9fe)', color: '#4338ca', border: '1px solid #c7d2fe' }}
          >
            {sector}
          </span>
        ))}
      </div>

      {/* ── Section: Recommended Internships ── */}
      <div>
        <div className="flex items-center gap-3.5 mb-6">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-md" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
            <span className="text-xl">🎯</span>
          </div>
          <div>
            <h3 className="text-xl font-extrabold text-gray-900 tracking-tight">Recommended Internships</h3>
            <p className="text-xs text-gray-400 font-medium">Ranked by match score</p>
          </div>
        </div>
        <div className="space-y-5">
          {results.map((internship, idx) => (
            <RecommendationCard
              key={internship.id}
              internship={internship}
              rank={idx + 1}
              t={t}
            />
          ))}
        </div>
      </div>

      {/* ── Section: Skill Gap Suggestions ── */}
      <SkillGapSuggestions results={results} userSkills={userSkills} />

      {/* ── Section: Learning Resources ── */}
      <LearningResources results={results} userSkills={userSkills} />

      {/* Reset button */}
      <div className="text-center pt-6 pb-2">
        <button
          onClick={onReset}
          className="px-12 py-4 rounded-2xl font-bold text-base transition-all duration-300 hover:shadow-lg"
          style={{ background: 'linear-gradient(135deg, #f1f5f9, #e2e8f0)', color: '#475569', border: '1px solid #cbd5e1' }}
        >
          {t.startOver}
        </button>
      </div>
    </div>
  );
}
