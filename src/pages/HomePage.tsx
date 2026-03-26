import { useState, useCallback, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.tsx";
import Header from "../components/Header.tsx";
import CandidateForm from "../components/CandidateForm.tsx";
import RecommendationList from "../components/RecommendationList.tsx";
import ApiKeySetup from "../components/ApiKeySetup.tsx";
import Footer from "../components/Footer.tsx";
import { SkeletonList } from "../components/SkeletonCard.tsx";
import ErrorBoundary from "../components/ErrorBoundary.tsx";
import OnboardingModal from "../components/OnboardingModal.tsx";
import { translations, skillKeyMap, TranslationContent } from "../data/translations.ts";
import { getRecommendations } from "../engine/recommendationEngine";
import { getAIRecommendations, isAIAvailable, CandidateProfile, FrontendRecommendation } from "../services/aiService";
import { getBackendRecommendations } from "../services/backendService";
import { useScrollReveal } from "../hooks/useScrollReveal";

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

  useScrollReveal();

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
      <Header t={t} currentLang={lang} onLangChange={setLang} />

      <main className={`relative z-10 ${showResults ? "max-w-6xl mx-auto px-5 py-10" : ""}`}>
        {!showResults ? (
          <div className="flex flex-col items-center">
            {/* Hero Section */}
            <section className="min-h-[90vh] w-full flex flex-col items-center justify-center text-center px-6 relative overflow-hidden">
              {/* Floating Orbs - Specific for Hero */}
              <div 
                className="absolute top-1/4 -left-20 w-[400px] h-[400px] rounded-full blur-[100px] animate-float-hero pointer-events-none" 
                style={{ background: 'rgba(108, 99, 255, 0.08)' }} 
              />
              <div 
                className="absolute bottom-1/4 -right-20 w-[300px] h-[300px] rounded-full blur-[80px] animate-float-hero pointer-events-none" 
                style={{ background: 'rgba(56, 189, 248, 0.06)', animationDelay: '-3s' }} 
              />
              <div 
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[250px] h-[250px] rounded-full blur-[60px] animate-float-hero pointer-events-none" 
                style={{ background: 'rgba(167, 139, 250, 0.07)', animationDelay: '-5s' }} 
              />

              <div className="relative z-10 animate-fadeIn space-y-8 max-w-4xl">
                {/* Pill Badge */}
                <div className="reveal inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md shadow-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-green animate-pulse-glow-green" />
                  <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-accent">
                    ✦ AI-Powered · TF-IDF · Cosine Similarity
                  </span>
                </div>

                {/* Headline */}
                <h1 className="reveal font-display font-extrabold text-white leading-[0.95] tracking-[-0.04em] text-[clamp(48px,8vw,90px)]">
                  Find internships that<br />
                  <span className="text-gradient-hero">actually fit you</span>
                </h1>

                {/* Subtitle */}
                <p className="reveal text-[#9898b0] text-lg font-body font-light leading-[1.7] max-w-[560px] mx-auto">
                  {t.tagline || "Our advanced AI engine analyzes your unique skill set to match you with opportunities that align with your career goals and potential."}
                </p>

                {/* CTAs */}
                <div className="reveal flex flex-wrap items-center justify-center gap-5 pt-4">
                  <button 
                    onClick={() => document.getElementById('matching-form')?.scrollIntoView({ behavior: 'smooth' })}
                    className="px-9 py-4 rounded-xl bg-accent text-white font-display font-bold text-base shadow-[0_8px_32px_rgba(108,99,255,0.3)] hover:-translate-y-0.5 transition-all hover:shadow-[0_12px_40px_rgba(108,99,255,0.4)]"
                  >
                    Start Matching →
                  </button>
                  <button className="flex items-center gap-3 px-9 py-4 rounded-xl border border-white/10 bg-white/5 font-display font-bold text-base text-white hover:bg-white/10 transition-all">
                    <div className="w-5 h-5 flex items-center justify-center rounded-full bg-white/10">
                      <svg className="w-2.5 h-2.5 fill-current" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                    </div>
                    Watch Demo
                  </button>
                </div>

                {/* Stats Bar */}
                <div className="reveal pt-16 pb-8">
                  <div className="inline-flex glass-dark p-1 rounded-2xl border border-white/5 shadow-2xl">
                    <div className="flex flex-wrap items-center divide-x divide-white/5 px-2">
                      {[
                        { val: "50+", lab: "Internships" },
                        { val: "12", lab: "Domains" },
                        { val: "250+", lab: "Skills" },
                        { val: "3", lab: "AI Engines" }
                      ].map((stat, i) => (
                        <div key={i} className="px-6 py-4 flex flex-col items-center">
                          <span className="text-xl font-display font-black text-white leading-none">
                            {stat.val}<span className="text-accent">.</span>
                          </span>
                          <span className="text-[10px] uppercase tracking-widest font-bold text-white/30 mt-1">
                            {stat.lab}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Matching Section (Candidate Form) */}
            <section id="matching-form" className="reveal w-full max-w-2xl px-5 py-20">
              <ApiKeySetup t={t} onKeySet={(ready: boolean = false) => setAiReady(ready)} />
              <div className="card-premium p-7 sm:p-10 shadow-card">
                <CandidateForm t={t} onSubmit={handleSubmit} />
              </div>
            </section>
          </div>
        ) : (
          <ErrorBoundary>
            {loading ? (
              <div className="space-y-8 animate-fadeIn">
                <p className="text-center text-sm font-mono font-bold uppercase tracking-widest text-accent mb-2 animate-pulse">{t.aiAnalyzing}</p>
                <SkeletonList count={3} />
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
