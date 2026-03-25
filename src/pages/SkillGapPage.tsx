import { useState, FormEvent } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.tsx";
import { fetchSkillGapAnalysis } from "../services/dashboardService.ts";

interface SkillGapAnalysis {
  readiness_score: number;
  summary: string;
  current_strengths: Array<{
    skill: string;
    level: string;
    relevance: string;
    note: string;
  }>;
  skill_gaps: Array<{
    skill: string;
    importance: string;
    reason: string;
    estimated_time: string;
    resources: string[];
  }>;
  learning_path: Array<{
    phase: string;
    title: string;
    duration: string;
    skills_to_learn: string[];
    milestones: string[];
  }>;
  recommended_projects: Array<{
    title: string;
    description: string;
    difficulty: string;
    skills_practiced: string[];
  }>;
}

export default function SkillGapPage() {
  const { isAuthenticated } = useAuth();
  const [skills, setSkills] = useState("");
  const [domain, setDomain] = useState("all");
  const [experience, setExperience] = useState("beginner");
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<SkillGapAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);

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
      <header className="header-gradient text-white px-4 py-4 relative z-10">
        <div className="max-w-5xl mx-auto flex items-center justify-between relative z-10">
          <Link to="/" className="flex items-center gap-3 text-xl font-extrabold group">
            <span className="w-11 h-11 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-105" style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(8px)' }}>🎯</span>
            <span className="tracking-tight">InternMatch AI</span>
          </Link>
          <div className="flex items-center gap-1">
            <Link to="/" className="text-sm text-white/70 hover:text-white px-3 py-2 rounded-xl hover:bg-white/10 transition-all duration-200 font-medium">
              Home
            </Link>
            {isAuthenticated ? (
              <Link to="/dashboard" className="text-sm text-white/70 hover:text-white px-3 py-2 rounded-xl hover:bg-white/10 transition-all duration-200 font-semibold">
                Dashboard
              </Link>
            ) : (
              <Link to="/login" className="text-sm text-white/70 hover:text-white px-3 py-2 rounded-xl hover:bg-white/10 transition-all duration-200 font-semibold">
                Sign In
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <div className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-5 shadow-lg" style={{ background: 'linear-gradient(135deg, #eef2ff, #ede9fe)', boxShadow: '0 8px 24px rgba(99, 102, 241, 0.15)' }}>
            <span className="text-4xl">🧠</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">AI Skill Gap Analysis</h1>
          <p className="text-gray-400 mt-3 font-semibold text-base">
            Discover what skills you need to land your dream internship
          </p>
        </div>

        {/* Input Form */}
        <div className="card-premium p-8 sm:p-9 mb-10">
          {error && (
            <div className="mb-6 p-4 rounded-2xl text-sm font-semibold flex items-center gap-2.5" style={{ background: 'linear-gradient(135deg, #fef2f2, #fecaca)', color: '#dc2626', border: '1px solid #fca5a5' }}>
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2.5">
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
                <label className="block text-sm font-bold text-gray-700 mb-2.5">
                  Target Domain
                </label>
                <select
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  className="input-premium"
                >
                  {domains.map((d) => (
                    <option key={d} value={d}>
                      {d === "all" ? "All Domains" : d}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2.5">
                  Experience Level
                </label>
                <select
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  className="input-premium"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-4 rounded-2xl disabled:opacity-50 text-base font-bold"
              style={loading ? { background: '#94a3b8', boxShadow: 'none' } : {}}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                  Analyzing...
                </span>
              ) : "Analyze My Skills"}
            </button>
          </form>
        </div>

        {/* Loading */}
        {loading && (
          <div className="text-center py-20">
            <div className="w-16 h-16 border-4 border-primary-200 rounded-full animate-spin border-t-primary-600 mx-auto" style={{ borderTopColor: '#6366f1' }} />
            <p className="mt-5 text-gray-400 font-semibold">AI is analyzing your skills...</p>
          </div>
        )}

        {/* Results */}
        {analysis && !loading && (
          <div className="space-y-7 animate-slideUp">
            {/* Summary */}
            <div className="card-premium p-8 sm:p-9">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">Analysis Results</h2>
                <div
                  className={`text-3xl font-extrabold ${
                    analysis.readiness_score >= 70
                      ? "text-green-600"
                      : analysis.readiness_score >= 40
                      ? "text-yellow-600"
                      : "text-red-600"
                  }`}
                >
                  {analysis.readiness_score}%
                  <span className="text-sm font-semibold text-gray-400 ml-1.5">ready</span>
                </div>
              </div>
              <p className="text-gray-600 leading-relaxed">{analysis.summary}</p>
            </div>

            {/* Current Strengths */}
            {analysis.current_strengths && analysis.current_strengths.length > 0 && (
              <div className="card-premium p-8 sm:p-9">
                <h3 className="font-extrabold text-gray-900 mb-6 text-lg flex items-center gap-2.5">
                  <span className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #dcfce7, #bbf7d0)' }}>✅</span>
                  Current Strengths
                </h3>
                <div className="space-y-4">
                  {analysis.current_strengths.map((s, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <span
                        className="text-xs font-bold px-2.5 py-1 rounded-lg"
                        style={
                          s.relevance === "High"
                            ? { background: 'linear-gradient(135deg, #dcfce7, #bbf7d0)', color: '#15803d', border: '1px solid #86efac' }
                            : s.relevance === "Medium"
                            ? { background: 'linear-gradient(135deg, #fef9c3, #fde68a)', color: '#a16207', border: '1px solid #fcd34d' }
                            : { background: 'rgba(241,245,249,0.8)', color: '#64748b', border: '1px solid #e2e8f0' }
                        }
                      >
                        {s.relevance}
                      </span>
                      <div>
                        <span className="font-bold text-gray-900">{s.skill}</span>
                        <span className="text-sm text-gray-400 ml-2 font-medium">({s.level})</span>
                        <p className="text-sm text-gray-500 mt-0.5">{s.note}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Skill Gaps */}
            {analysis.skill_gaps && analysis.skill_gaps.length > 0 && (
              <div className="card-premium p-8 sm:p-9">
                <h3 className="font-extrabold text-gray-900 mb-6 text-lg flex items-center gap-2.5">
                  <span className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #eef2ff, #ede9fe)' }}>📈</span>
                  Skill Gaps to Fill
                </h3>
                <div className="space-y-5">
                  {analysis.skill_gaps.map((gap, i) => (
                    <div key={i} className="pl-5" style={{ borderLeft: '4px solid #6366f1', borderRadius: '0 12px 12px 0' }}>
                      <div className="flex items-center gap-2.5 mb-1.5">
                        <span className="font-bold text-gray-900">{gap.skill}</span>
                        <span
                          className="text-xs font-bold px-2.5 py-0.5 rounded-lg"
                          style={
                            gap.importance === "High"
                              ? { background: 'linear-gradient(135deg, #fef2f2, #fecaca)', color: '#dc2626', border: '1px solid #fca5a5' }
                              : gap.importance === "Medium"
                              ? { background: 'linear-gradient(135deg, #fef9c3, #fde68a)', color: '#a16207', border: '1px solid #fcd34d' }
                              : { background: 'rgba(241,245,249,0.8)', color: '#64748b', border: '1px solid #e2e8f0' }
                          }
                        >
                          {gap.importance}
                        </span>
                        <span className="text-xs text-gray-400 font-medium">{gap.estimated_time}</span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{gap.reason}</p>
                      {gap.resources && gap.resources.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {gap.resources.map((r, j) => (
                            <span
                              key={j}
                              className="text-xs px-2.5 py-1 rounded-lg font-medium"
                              style={{ background: 'linear-gradient(135deg, #dbeafe, #bfdbfe)', color: '#1d4ed8', border: '1px solid #93c5fd' }}
                            >
                              {r}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Learning Path */}
            {analysis.learning_path && analysis.learning_path.length > 0 && (
              <div className="card-premium p-8 sm:p-9">
                <h3 className="font-extrabold text-gray-900 mb-6 text-lg flex items-center gap-2.5">
                  <span className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #eef2ff, #ede9fe)' }}>🗺️</span>
                  Learning Path
                </h3>
                <div className="space-y-5">
                  {analysis.learning_path.map((phase) => (
                    <div key={phase.phase} className="relative pl-10">
                      <div className="absolute left-0 top-0 w-7 h-7 rounded-xl text-white text-xs flex items-center justify-center font-extrabold" style={{ background: 'linear-gradient(135deg, #6366f1, #7c3aed)' }}>
                        {phase.phase}
                      </div>
                      <div>
                        <div className="flex items-center gap-2.5">
                          <span className="font-bold text-gray-900">{phase.title}</span>
                          <span className="text-xs text-gray-400 font-medium">{phase.duration}</span>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {phase.skills_to_learn.map((s) => (
                            <span
                              key={s}
                              className="text-xs px-2.5 py-1 rounded-lg font-semibold"
                              style={{ background: 'linear-gradient(135deg, #eef2ff, #ede9fe)', color: '#4338ca', border: '1px solid #c7d2fe' }}
                            >
                              {s}
                            </span>
                          ))}
                        </div>
                        <ul className="mt-2 text-sm text-gray-500 list-disc list-inside space-y-0.5">
                          {phase.milestones.map((m, i) => (
                            <li key={i}>{m}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recommended Projects */}
            {analysis.recommended_projects && analysis.recommended_projects.length > 0 && (
              <div className="card-premium p-8 sm:p-9">
                <h3 className="font-extrabold text-gray-900 mb-6 text-lg flex items-center gap-2.5">
                  <span className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #eef2ff, #ede9fe)' }}>🛠️</span>
                  Recommended Projects
                </h3>
                <div className="grid gap-5 sm:grid-cols-2">
                  {analysis.recommended_projects.map((p, i) => (
                    <div key={i} className="rounded-2xl p-5 transition-all duration-300 hover:shadow-md" style={{ background: 'rgba(248, 250, 252, 0.6)', border: '1px solid rgba(226, 232, 240, 0.5)' }}>
                      <div className="flex items-center justify-between mb-2.5">
                        <span className="font-bold text-gray-900">{p.title}</span>
                        <span className="text-xs font-bold px-2.5 py-1 rounded-lg" style={{ background: 'rgba(241, 245, 249, 0.8)', color: '#64748b', border: '1px solid #e2e8f0' }}>
                          {p.difficulty}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mb-3">{p.description}</p>
                      <div className="flex flex-wrap gap-1.5">
                        {p.skills_practiced.map((s) => (
                          <span
                            key={s}
                            className="text-xs px-2.5 py-1 rounded-lg font-medium"
                            style={{ background: 'linear-gradient(135deg, #dcfce7, #bbf7d0)', color: '#15803d', border: '1px solid #86efac' }}
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
