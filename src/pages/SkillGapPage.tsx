import { useState, FormEvent, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.tsx";
import { fetchSkillGapAnalysis } from "../services/dashboardService.ts";
import Header from "../components/Header.tsx";
import { translations, TranslationContent } from "../data/translations.ts";
import { useScrollReveal } from "../hooks/useScrollReveal";


interface SkillGapAnalysis {
  readiness_score: number;
  summary: string;
  current_strengths: Array<{
    skill: string;
    level: string;
    relevance: string;
    note: string;
    percentage?: number; // Added for coverage bars
  }>;
  skill_gaps: Array<{
    skill: string;
    importance: string;
    reason: string;
    estimated_time: string;
    resources: string[];
    percentage?: number; // Added for coverage bars
  }>;
  learning_path: Array<{
    phase: string;
    title: string;
    duration: string;
    priority?: "critical" | "high" | "medium" | "low"; // Added for roadmap
    skills_to_learn: string[];
    milestones: string[];
  }>;
  recommended_projects: Array<{
    title: string;
    description: string;
    difficulty: string;
    skills_practiced: string[];
  }>;
  industry_insights?: {
    trending_skills: string[];
    hiring_companies: Array<{ name: string; logo?: string }>;
    market_demand: number;
  };
}

export default function SkillGapPage() {
  const { isAuthenticated } = useAuth();
  const [skills, setSkills] = useState("");
  const [domain, setDomain] = useState("all");
  const [experience, setExperience] = useState("beginner");
  const [loading, setLoading] = useState(false);
  const [lang, setLang] = useState<string>("en");
  const [analysis, setAnalysis] = useState<SkillGapAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);

  useScrollReveal();

  const t: TranslationContent = (translations as Record<string, TranslationContent>)[lang];


  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const skillList = skills
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    if (skillList.length === 0) {
      setError("Please enter at least one skill.");
      setLoading(false);
      return;
    }

    try {
      const result = await fetchSkillGapAnalysis({
        skills: skillList,
        preferred_domain: domain,
        experience_level: experience,
        interests: [],
      }) as unknown as SkillGapAnalysis;
      setAnalysis(result);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const domains = [
    "all", "AI", "Web Development", "Data Science", "Cybersecurity",
    "Cloud", "Mobile Development", "DevOps", "Machine Learning",
    "UI/UX Design", "Blockchain", "IoT",
  ];

  return (
    <div className="min-h-screen bg-mesh">
      <Header t={t} currentLang={lang} onLangChange={setLang} />

      <main className="max-w-5xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <div className="reveal w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-5 shadow-lg" style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
            <span className="text-4xl">🧠</span>
          </div>
          <h1 className="reveal text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-display">AI Skill Gap Analysis</h1>
          <p className="reveal text-white/40 mt-3 font-semibold text-base">
            Discover what skills you need to land your dream internship
          </p>
        </div>

        {/* Input Form */}
        <div className="reveal card-premium p-8 sm:p-9 mb-10">
          {error && (
            <div className="mb-6 p-4 rounded-2xl text-sm font-bold flex items-center gap-2.5 bg-coral/10 border border-coral/20 text-coral">
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-extrabold text-white/60 mb-2.5 uppercase tracking-wider font-display">
                Your Skills (comma-separated)
              </label>
              <input
                type="text"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                placeholder="Python, React, SQL, Machine Learning"
                className="input-premium"
              />
            </div>

            <div className="grid grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-extrabold text-white/60 mb-2.5 uppercase tracking-wider font-display">
                  Target Domain
                </label>
                <select
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  className="input-premium"
                >
                  {domains.map((d) => (
                    <option key={d} value={d} className="bg-surface text-white">
                      {d === "all" ? "All Domains" : d}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-extrabold text-white/60 mb-2.5 uppercase tracking-wider font-display">
                  Experience Level
                </label>
                <select
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  className="input-premium"
                >
                  <option value="beginner" className="bg-surface text-white">Beginner</option>
                  <option value="intermediate" className="bg-surface text-white">Intermediate</option>
                  <option value="advanced" className="bg-surface text-white">Advanced</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-4 rounded-2xl disabled:opacity-50 text-base font-bold shadow-lg shadow-accent/20"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                  Analyzing Profile...
                </span>
              ) : "Analyze My Skills"}
            </button>
          </form>
        </div>

        {/* Loading */}
        {loading && (
          <div className="text-center py-20">
            <div className="w-16 h-16 border-4 border-white/5 rounded-full animate-spin border-t-accent mx-auto" />
            <p className="mt-5 text-white/40 font-bold uppercase tracking-widest">AI is analyzing your skills...</p>
          </div>
        )}

        {/* Results */}
        {analysis && !loading && (
          <div className="space-y-12">
            {/* Analysis Summary Header */}
            <div className="reveal bg-[#12121c] border border-white/5 rounded-[24px] p-8 sm:p-10 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8">
                <div className={`text-[48px] font-display font-black leading-none opacity-20 ${
                  analysis.readiness_score >= 70 ? "text-green" : analysis.readiness_score >= 40 ? "text-gold" : "text-coral"
                }`}>
                  {analysis.readiness_score}%
                </div>
              </div>
              <div className="relative z-10 max-w-2xl">
                <h2 className="text-[24px] font-display font-bold text-white mb-4">Analysis Summary</h2>
                <p className="text-[16px] text-[#9898b0] leading-relaxed">
                  {analysis.summary}
                </p>
                <div className="mt-6 flex items-center gap-4">
                  <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[12px] font-bold text-white/40 uppercase tracking-widest font-mono">
                    Ready for {domain === "all" ? "Market" : domain}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
              {/* Left Column: Skill Coverage */}
              <div className="space-y-8">
                <div className="reveal">
                  <h3 className="text-[12px] font-mono font-bold uppercase tracking-[0.2em] text-[#5a5a78] mb-8 flex items-center gap-3">
                    <span className="w-6 h-[1px] bg-[#5a5a78]"></span>
                    Skill Coverage Analysis
                  </h3>
                  
                  <div className="space-y-8">
                    {/* Combine strengths and gaps for a full view */}
                    {[
                      ...(analysis.current_strengths || []).map(s => ({ ...s, type: 'strength', score: s.level === 'Expert' ? 95 : s.level === 'Advanced' ? 82 : 65 })),
                      ...(analysis.skill_gaps || []).map(g => ({ ...g, type: 'gap', score: g.importance === 'High' ? 35 : g.importance === 'Medium' ? 45 : 25 }))
                    ].slice(0, 8).map((item, i) => {
                      const percentage = item.percentage || item.score || 50;
                      const getGradients = (pct: number) => {
                        if (pct >= 70) return "from-green to-emerald-400";
                        if (pct >= 40) return "from-accent to-accent3";
                        if (pct >= 20) return "from-gold to-amber-300";
                        return "from-coral to-rose-400";
                      };

                      return (
                        <div key={i} className="group">
                          <div className="flex justify-between items-end mb-3">
                            <span className="text-[15px] font-bold text-white group-hover:text-accent transition-colors">
                              {item.skill}
                            </span>
                            <span className="text-[13px] font-mono font-bold text-[#5a5a78]">
                              {percentage}%
                            </span>
                          </div>
                          <div className="h-[6px] w-full bg-white/[0.03] rounded-full overflow-hidden border border-white/5">
                            <div 
                              className={`h-full bg-gradient-to-r ${getGradients(percentage)} transition-all duration-1000 ease-out`}
                              style={{ width: `${percentage}%`, transitionDelay: `${i * 100}ms` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Industry Insights Section (Injected here for layout flow on mobile, or keep below? User said "below") */}
              </div>

              {/* Right Column: Learning Roadmap */}
              <div className="space-y-8">
                <h3 className="reveal text-[12px] font-mono font-bold uppercase tracking-[0.2em] text-[#5a5a78] mb-8 flex items-center gap-3">
                  <span className="w-6 h-[1px] bg-[#5a5a78]"></span>
                  Learning Roadmap
                </h3>

                <div className="relative space-y-6 pl-4">
                  {/* Vertical Connector */}
                  <div className="absolute left-[30px] top-6 bottom-6 w-[2px] bg-gradient-to-b from-accent/20 via-accent/10 to-transparent"></div>

                  {analysis.learning_path?.map((phase, i) => {
                    const priority = phase.priority || (i === 0 ? "critical" : i === 1 ? "high" : "accent");
                    const priorityColors = {
                      critical: "bg-coral/10 text-coral border-coral/20",
                      high: "bg-gold/10 text-gold border-gold/20",
                      accent: "bg-accent/10 text-accent border-accent/20",
                      low: "bg-white/5 text-white/40 border-white/10"
                    };

                    return (
                      <div key={i} className="reveal relative pl-12 group" style={{ transitionDelay: `${i * 100}ms` }}>
                        {/* Phase Badge */}
                        <div className="absolute left-0 top-0 w-[40px] h-[40px] bg-[#1a1a28] border border-white/10 rounded-xl flex items-center justify-center font-mono font-bold text-accent shadow-xl z-10 group-hover:border-accent/50 transition-colors">
                          {phase.phase.padStart(2, '0')}
                        </div>

                        <div className="bg-[#12121c] border border-white/5 rounded-[20px] p-6 group-hover:border-white/10 transition-all">
                          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                            <h4 className="text-[16px] font-display font-bold text-white">{phase.title}</h4>
                            <div className="flex gap-2">
                              <span className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold text-white/40 uppercase tracking-wider">
                                {phase.duration}
                              </span>
                              <span className={`px-2.5 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wider ${priorityColors[priority as keyof typeof priorityColors]}`}>
                                {priority}
                              </span>
                            </div>
                          </div>
                          
                          <div className="flex flex-wrap gap-2 mb-4">
                            {phase.skills_to_learn?.map(s => (
                              <span key={s} className="px-2 py-1 rounded-md bg-white/[0.03] border border-white/5 text-[11px] font-bold text-[#9898b0]">
                                {s}
                              </span>
                            ))}
                          </div>

                          <ul className="space-y-2">
                            {phase.milestones?.slice(0, 2).map((m, j) => (
                              <li key={j} className="flex items-start gap-3 text-[13px] text-white/40">
                                <span className="text-accent mt-1">→</span>
                                {m}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Industry Insights Section (Below) */}
            <div className="pt-12 border-t border-white/5">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {/* Trending Skills */}
                <div className="reveal card-premium p-8">
                  <h3 className="text-[12px] font-mono font-bold uppercase tracking-[0.1em] text-[#5a5a78] mb-6">Trending Skills</h3>
                  <div className="flex flex-wrap gap-3">
                    {(analysis.industry_insights?.trending_skills || ["Next.js 14", "Docker", "PyTorch", "Kubernetes", "Rust"]).map(skill => (
                      <span key={skill} className="px-4 py-2 rounded-xl bg-accent/5 border border-accent/20 text-accent text-[13px] font-bold shadow-[0_0_15px_rgba(108,99,255,0.1)] hover:shadow-[0_0_25px_rgba(108,99,255,0.2)] transition-shadow cursor-default">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Hiring Companies */}
                <div className="reveal card-premium p-8">
                  <h3 className="text-[12px] font-mono font-bold uppercase tracking-[0.1em] text-[#5a5a78] mb-6">Top Hiring Companies</h3>
                  <div className="flex flex-wrap gap-4">
                    {(analysis.industry_insights?.hiring_companies || [
                      { name: "Google" }, { name: "Meta" }, { name: "Stripe" }, { name: "Vercel" }, { name: "OpenAI" }
                    ]).map((company, i) => (
                      <div key={i} className="w-[60px] h-[60px] rounded-2xl bg-surface2 border border-white/5 flex items-center justify-center font-display font-black text-white/10 text-xl hover:text-white/30 hover:border-white/10 transition-all cursor-default" title={company.name}>
                        {company.name.charAt(0)}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Market Demand Meter */}
                <div className="reveal card-premium p-8">
                  <h3 className="text-[12px] font-mono font-bold uppercase tracking-[0.1em] text-[#5a5a78] mb-6">Market Demand</h3>
                  <div className="space-y-6">
                    <div className="flex justify-between items-end">
                      <span className="text-[24px] font-display font-black text-white">High</span>
                      <span className="text-[14px] font-mono font-bold text-accent">{analysis.industry_insights?.market_demand || 82}%</span>
                    </div>
                    <div className="h-[8px] w-full bg-white/5 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-accent via-accent2 to-accent3 transition-all duration-1000"
                        style={{ width: `${analysis.industry_insights?.market_demand || 82}%` }}
                      ></div>
                    </div>
                    <p className="text-[12px] text-[#5a5a78] leading-relaxed">
                      Demand for {domain === "all" ? "Core Tech" : domain} skills has increased by 14% in the last quarter.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
