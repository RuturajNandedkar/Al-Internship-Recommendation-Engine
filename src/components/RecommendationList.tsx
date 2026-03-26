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
        <div className="w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-6" style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <span className="text-5xl">🔍</span>
        </div>
        <p className="text-white/40 text-lg mb-8 font-extrabold font-display uppercase tracking-widest">{t.noResults}</p>
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
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-display">{t.yourRecommendations}</h2>
        <p className="text-sm text-white/40 mt-2.5 font-medium">{t.resultsSummary}</p>
        {aiUsed && (
          <span className="inline-flex items-center gap-2 mt-4 text-[10px] font-bold px-5 py-2 rounded-full uppercase tracking-widest" style={{ background: 'rgba(108, 99, 255, 0.1)', color: 'var(--accent)', border: '1px solid rgba(108, 99, 255, 0.2)' }}>
            <span className="w-2 h-2 rounded-full bg-accent animate-pulse"></span>
            🤖 {t.aiGenerated}
          </span>
        )}
      </div>

      {/* Quick Stats Dashboard */}
      <div className="grid grid-cols-3 gap-4 sm:gap-5">
        <div className="stat-card text-center py-6 bg-surface/50 border border-white/5">
          <div className="text-2xl sm:text-3xl font-extrabold text-accent font-display">{topScore}%</div>
          <div className="text-[10px] text-white/20 mt-1.5 font-bold uppercase tracking-widest">Best Match</div>
        </div>
        <div className="stat-card text-center py-6 bg-surface/50 border border-white/5">
          <div className="text-2xl sm:text-3xl font-extrabold text-green font-display">{avgScore}%</div>
          <div className="text-[10px] text-white/20 mt-1.5 font-bold uppercase tracking-widest">Avg Match</div>
        </div>
        <div className="stat-card text-center py-6 bg-surface/50 border border-white/5">
          <div className="text-2xl sm:text-3xl font-extrabold text-gold font-display">{results.length}</div>
          <div className="text-[10px] text-white/20 mt-1.5 font-bold uppercase tracking-widest">Internships</div>
        </div>
      </div>

      {/* Sector summary */}
      <div className="flex flex-wrap items-center justify-center gap-2.5">
        <span className="text-[10px] text-white/20 font-bold uppercase tracking-widest">Sectors:</span>
        {sectors.map((sector) => (
          <span
            key={sector}
            className="text-[10px] px-3.5 py-1.5 rounded-xl font-bold uppercase tracking-wider"
            style={{ background: 'rgba(108, 99, 255, 0.1)', color: 'var(--accent)', border: '1px solid rgba(108, 99, 255, 0.2)' }}
          >
            {sector}
          </span>
        ))}
      </div>

      {/* ── Section: Recommended Internships ── */}
      <div>
        <div className="flex items-center gap-3.5 mb-6">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg" style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent2))' }}>
            <span className="text-xl">🎯</span>
          </div>
          <div>
            <h3 className="text-xl font-extrabold text-white tracking-tight font-display">Recommended Internships</h3>
            <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest">Ranked by match score</p>
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
          className="px-12 py-4 rounded-2xl font-bold text-base transition-all duration-300 hover:bg-white/5 border border-white/10 text-white/40 uppercase tracking-widest"
        >
          {t.startOver}
        </button>
      </div>
    </div>
  );
}
