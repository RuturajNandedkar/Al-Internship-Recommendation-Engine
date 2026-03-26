import { useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.tsx";
import Header from "../components/Header.tsx";
import CandidateForm from "../components/CandidateForm.tsx";
import RecommendationList from "../components/RecommendationList.tsx";
import ApiKeySetup from "../components/ApiKeySetup.tsx";
import Footer from "../components/Footer.tsx";
import SkeletonCard from "../components/SkeletonCard.tsx";
import ErrorBoundary from "../components/ErrorBoundary.tsx";
import OnboardingModal from "../components/OnboardingModal.tsx";
import { translations, skillKeyMap, TranslationContent } from "../data/translations.ts";
import { getRecommendations } from "../engine/recommendationEngine";
import { getAIRecommendations, isAIAvailable, CandidateProfile, FrontendRecommendation } from "../services/aiService";
import { getBackendRecommendations } from "../services/backendService";

/** Resolve skill indices to English skill name strings. */
function resolveSkillNames(skillIndices: number[]): string[] {
  const englishSkills = Object.keys(skillKeyMap);
  return (skillIndices || []).map((idx) => englishSkills[idx]).filter(Boolean);
}

export default function HomePage() {
  const { isAuthenticated } = useAuth();
  const [lang, setLang] = useState<string>("en");
  const [results, setResults] = useState<FrontendRecommendation[] | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(false);
  const [aiUsed, setAiUsed] = useState(false);
  const [aiReady, setAiReady] = useState(isAIAvailable());
  const [userSkills, setUserSkills] = useState<string[]>([]);

  const t: TranslationContent = (translations as Record<string, TranslationContent>)[lang];

  const handleSubmit = useCallback(async (profile: CandidateProfile) => {
    setLoading(true);
    setShowResults(true);
    setUserSkills(resolveSkillNames(profile.skills));
    window.scrollTo({ top: 0, behavior: "smooth" });

    // 1. Try backend API first (uses AI enhancement if Gemini is configured on backend)
    try {
      const backendResults = await getBackendRecommendations(profile) as any;
      if (backendResults && backendResults.length > 0) {
        setResults(backendResults);
        setAiUsed(!!backendResults._aiUsed);
        setLoading(false);
        return;
      }
    } catch (err: any) {
      console.warn("Backend API failed, trying client-side AI:", err.message);
    }

    // 2. Try Gemini AI (client-side)
    try {
      if (isAIAvailable()) {
        const aiResults = await getAIRecommendations(profile, 5);
        if (aiResults && aiResults.length > 0) {
          setResults(aiResults);
          setAiUsed(true);
          setLoading(false);
          return;
        }
      }
    } catch (err: any) {
      console.warn("AI recommendation failed, using fallback engine:", err.message);
    }

    // 3. Fallback to local scoring engine
    const recommendations = getRecommendations(profile, 5) as unknown as FrontendRecommendation[];
    setResults(recommendations);
    setAiUsed(false);
    setLoading(false);
  }, []);

  const handleReset = useCallback(() => {
    setResults(null);
    setShowResults(false);
    setAiUsed(false);
    setUserSkills([]);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <div className="min-h-screen bg-mesh relative">
      {/* Decorative orbs */}
      <div className="orb orb-primary w-[400px] h-[400px] -top-48 -left-48 fixed" />
      <div className="orb orb-purple w-[300px] h-[300px] top-1/3 -right-32 fixed" />
      <div className="orb orb-blue w-[250px] h-[250px] bottom-20 left-1/4 fixed" />

      <Header t={t} currentLang={lang} onLangChange={setLang} />

      {/* Auth Navigation Bar */}
      <div className="max-w-3xl mx-auto px-5 pt-4 pb-1 flex justify-end gap-1.5 relative z-10">
        <Link
          to="/skill-gap"
          className="text-sm text-gray-500 hover:text-primary-600 font-medium px-4 py-2 rounded-xl hover:bg-white/60 transition-all duration-300 backdrop-blur-sm"
        >
          Skill Gap Analysis
        </Link>
        {isAuthenticated ? (
          <Link
            to="/dashboard"
            className="text-sm text-gray-500 hover:text-primary-600 font-medium px-4 py-2 rounded-xl hover:bg-white/60 transition-all duration-300 backdrop-blur-sm"
          >
            Dashboard
          </Link>
        ) : (
          <>
            <Link
              to="/login"
              className="text-sm text-gray-500 hover:text-primary-600 font-medium px-4 py-2 rounded-xl hover:bg-white/60 transition-all duration-300 backdrop-blur-sm"
            >
              Sign In
            </Link>
            <Link
              to="/signup"
              className="text-sm px-5 py-2 text-white rounded-xl font-semibold transition-all duration-300 hover:-translate-y-0.5 hover:shadow-colored"
              style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5, #7c3aed)', boxShadow: '0 4px 15px rgba(79, 70, 229, 0.3)' }}
            >
              Sign Up
            </Link>
          </>
        )}
      </div>

      <main className={`mx-auto px-5 py-10 relative z-10 ${showResults ? "max-w-3xl" : "max-w-2xl"}`}>
        {!showResults ? (
          <div className="animate-slideUp">
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 backdrop-blur-sm border border-primary-100/50 text-primary-600 text-sm font-medium mb-4 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-primary-400 animate-pulse" />
                AI-Powered Matching
              </div>
              <p className="text-gray-500 text-base sm:text-lg font-medium max-w-lg mx-auto leading-relaxed">{t.tagline}</p>
            </div>

            <ApiKeySetup t={t} onKeySet={(ready: boolean) => setAiReady(ready)} />

            <div className="card-premium p-7 sm:p-10 shadow-card">
              <CandidateForm t={t} onSubmit={handleSubmit} />
            </div>
          </div>
        ) : (
          <ErrorBoundary>
            {loading ? (
              <div className="space-y-5 animate-fadeIn">
                <p className="text-center text-sm font-semibold text-gray-400 mb-2">{t.aiAnalyzing}</p>
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
              </div>
            ) : (
              <div className="animate-slideUp">
                <RecommendationList
                  results={results || []}
                  t={t}
                  onReset={handleReset}
                  aiUsed={aiUsed}
                  userSkills={userSkills}
                />
              </div>
            )}
          </ErrorBoundary>
        )}
      </main>

      <Footer t={t} />
      <OnboardingModal />
    </div>
  );
}
