import { useState, useEffect, useCallback, FormEvent, ChangeEvent } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.tsx";
import {
  fetchDashboard,
  fetchSavedInternships,
  removeSavedInternship,
  fetchHistory,
  uploadResume,
  DashboardStats,
  SavedInternship,
  RecommendationHistory,
  HistoryResponse,
  ResumeUploadResult
} from "../services/dashboardService";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: string;
  subtext?: string;
}

function StatCard({ label, value, icon, subtext }: StatCardProps) {
  return (
    <div className="stat-card group cursor-default">
      <div className="flex items-center gap-4">
        <div className="rounded-2xl flex items-center justify-center shadow-sm transition-transform duration-300 group-hover:scale-110" style={{ width: '52px', height: '52px', background: 'linear-gradient(135deg, #eef2ff, #e0e7ff)' }}>
          <span className="text-2xl">{icon}</span>
        </div>
        <div>
          <p className="text-2xl font-extrabold text-gray-900 tracking-tight">{value}</p>
          <p className="text-sm text-gray-500 font-medium">{label}</p>
          {subtext && <p className="text-xs text-gray-400 mt-0.5">{subtext}</p>}
        </div>
      </div>
    </div>
  );
}

interface ProgressBarProps {
  value: number;
  max?: number;
  color?: "primary" | "green" | "yellow" | "red";
}

function ProgressBar({ value, max = 100, color = "primary" }: ProgressBarProps) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  const gradients = {
    primary: "linear-gradient(90deg, #6366f1, #8b5cf6)",
    green: "linear-gradient(90deg, #22c55e, #16a34a)",
    yellow: "linear-gradient(90deg, #eab308, #f59e0b)",
    red: "linear-gradient(90deg, #ef4444, #dc2626)",
  };
  return (
    <div className="w-full bg-gray-100 rounded-full h-3.5 overflow-hidden progress-bar-animated">
      <div
        className="h-3.5 rounded-full transition-all duration-1000 ease-out"
        style={{ width: `${pct}%`, background: (gradients as any)[color] || gradients.primary }}
      />
    </div>
  );
}

interface MiniBarChartProps {
  data: Array<{ domain: string; count: number; percentage: number }>;
  label: string;
}

function MiniBarChart({ data, label }: MiniBarChartProps) {
  if (!data || data.length === 0) return null;
  const max = Math.max(...data.map((d) => d.count));
  return (
    <div>
      <h4 className="text-sm font-bold text-gray-800 mb-4">{label}</h4>
      <div className="space-y-3">
        {data.map((item: any) => (
          <div key={item.domain} className="flex items-center gap-3">
            <span className="text-xs text-gray-600 w-24 truncate font-medium">{item.domain}</span>
            <div className="flex-1 bg-gray-100/80 rounded-full h-2.5 overflow-hidden">
              <div
                className="h-2.5 rounded-full transition-all duration-700 ease-out"
                style={{ width: `${(item.count / max) * 100}%`, background: 'linear-gradient(90deg, #818cf8, #6366f1)' }}
              />
            </div>
            <span className="text-xs text-gray-500 w-8 text-right font-semibold">{item.percentage}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

interface ScoreTrendChartProps {
  data: Array<{ date: string; avgScore: number; topScore: number }>;
}

function ScoreTrendChart({ data }: ScoreTrendChartProps) {
  if (!data || data.length === 0) return null;
  const maxScore = 100;
  return (
    <div>
      <h4 className="text-sm font-semibold text-gray-700 mb-3">Match Score Trend</h4>
      <div className="flex items-end gap-1.5 h-24">
        {data.map((point: any, idx: number) => (
          <div key={idx} className="flex-1 flex flex-col items-center gap-1">
            <span className="text-[10px] text-gray-400">{point.avgScore}%</span>
            <div
              className={`w-full rounded-t-md ${point.avgScore >= 70 ? "bg-gradient-to-t from-green-500 to-green-400" : point.avgScore >= 45 ? "bg-gradient-to-t from-yellow-500 to-yellow-400" : "bg-gradient-to-t from-orange-500 to-orange-400"}`}
              style={{ height: `${(point.avgScore / maxScore) * 70}px` }}
              title={`${new Date(point.date).toLocaleDateString()} — Avg: ${point.avgScore}%, Top: ${point.topScore}%`}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [dashboard, setDashboard] = useState<DashboardStats | null>(null);
  const [saved, setSaved] = useState<SavedInternship[]>([]);
  const [history, setHistory] = useState<RecommendationHistory[]>([]);
  const [historyPagination, setHistoryPagination] = useState<HistoryResponse["pagination"] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [resumeUploading, setResumeUploading] = useState(false);
  const [resumeResult, setResumeResult] = useState<ResumeUploadResult | null>(null);

  const loadDashboard = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchDashboard();
      setDashboard(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const loadSaved = useCallback(async () => {
    try {
      const data = await fetchSavedInternships();
      setSaved(data);
    } catch (err: any) {
      setError(err.message);
    }
  }, []);

  const loadHistory = useCallback(async (page = 1) => {
    try {
      const data = await fetchHistory(page);
      setHistory(data.data);
      setHistoryPagination(data.pagination);
    } catch (err: any) {
      setError(err.message);
    }
  }, []);

  useEffect(() => {
    if (activeTab === "saved") loadSaved();
    if (activeTab === "history") loadHistory();
  }, [activeTab, loadSaved, loadHistory]);

  const handleRemoveSaved = async (id: string) => {
    try {
      await removeSavedInternship(id);
      setSaved((prev) => prev.filter((s) => s._id !== id));
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleResumeUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setResumeUploading(true);
    setResumeResult(null);
    try {
      const result = await uploadResume(file);
      setResumeResult(result);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setResumeUploading(false);
    }
  };

  const tabs = [
    { id: "overview", label: "Overview", icon: "📊" },
    { id: "saved", label: "Saved", icon: "💾" },
    { id: "history", label: "History", icon: "📋" },
    { id: "resume", label: "Resume", icon: "📄" },
  ];

  return (
    <div className="min-h-screen bg-mesh">
      {/* Header */}
      <header className="header-gradient text-white px-5 py-5 relative z-10 shadow-xl">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        <div className="max-w-6xl mx-auto flex items-center justify-between relative z-10">
          <Link to="/" className="flex items-center gap-3 text-xl font-extrabold group">
            <span className="w-10 h-10 bg-white/10 rounded-2xl flex items-center justify-center border border-white/15 backdrop-blur-sm transition-transform duration-300 group-hover:scale-105">🎯</span>
            <span className="tracking-tight">InternMatch AI</span>
          </Link>
          <div className="flex items-center gap-2">
            <Link to="/" className="text-sm text-white/70 hover:text-white px-3 py-2 rounded-xl hover:bg-white/10 transition-all duration-300">
              Find Internships
            </Link>
            <Link to="/skill-gap" className="text-sm text-white/70 hover:text-white px-3 py-2 rounded-xl hover:bg-white/10 transition-all duration-300">
              Skill Gap
            </Link>
            <div className="h-5 w-px bg-white/15 mx-2" />
            <span className="text-sm text-white/80 font-medium px-2">Hi, {user?.name?.split(" ")[0]}</span>
            <button
              onClick={logout}
              className="text-sm text-red-300 hover:text-red-200 font-medium px-3 py-2 rounded-xl hover:bg-red-500/10 transition-all duration-300"
            >
              Logout
            </button>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      </header>

      <main className="max-w-6xl mx-auto px-5 py-10">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-8 tracking-tight">Dashboard</h1>

        {error && (
          <div className="mb-5 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-medium flex items-center justify-between">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
            <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700 font-semibold text-xs">
              Dismiss
            </button>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1.5 mb-10 rounded-2xl p-2 shadow-card" style={{ background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(12px)', border: '1px solid rgba(226,232,240,0.5)' }}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold transition-all duration-300 ${
                activeTab === tab.id
                  ? "text-white shadow-lg"
                  : "text-gray-500 hover:text-gray-700 hover:bg-white/60"
              }`}
              style={activeTab === tab.id ? { background: 'linear-gradient(135deg, #6366f1, #4f46e5, #7c3aed)', boxShadow: '0 4px 15px rgba(79, 70, 229, 0.3)' } : {}}
            >
              <span className="mr-1.5">{tab.icon}</span>{tab.label}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {loading ? (
              <div className="text-center py-12 text-gray-400 font-medium">Loading dashboard...</div>
            ) : dashboard ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <StatCard
                    label="Saved Internships"
                    value={dashboard.stats.savedInternships}
                    icon="💾"
                  />
                  <StatCard
                    label="Total Searches"
                    value={dashboard.stats.totalSearches}
                    icon="🔍"
                  />
                  <StatCard
                    label="Available Internships"
                    value={dashboard.stats.totalInternships || "—"}
                    icon="🎯"
                  />
                  <StatCard
                    label="Profile Score"
                    value={`${dashboard.stats.profileCompleteness || 0}%`}
                    icon={dashboard.stats.profileCompleteness >= 80 ? "✅" : "⚠️"}
                    subtext={dashboard.stats.profileCompleteness >= 80 ? "Profile complete" : "Complete your profile for better matches"}
                  />
                </div>

                {/* Profile Completeness Bar */}
                <div className="card-premium p-7">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-extrabold text-gray-900 tracking-tight">Profile Completeness</h3>
                    <span className="text-sm font-bold" style={{ color: '#6366f1' }}>{dashboard.stats.profileCompleteness || 0}%</span>
                  </div>
                  <ProgressBar value={dashboard.stats.profileCompleteness || 0} color={dashboard.stats.profileCompleteness >= 80 ? "green" : dashboard.stats.profileCompleteness >= 50 ? "yellow" : "red"} />
                  {dashboard.stats.profileCompleteness < 80 && (
                    <p className="text-xs text-gray-400 mt-2">Add more skills, interests, and location preferences to improve your matches.</p>
                  )}
                </div>

                {/* Analytics Section */}
                {dashboard.analytics && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Domain Distribution */}
                    {dashboard.analytics.domainDistribution && dashboard.analytics.domainDistribution.length > 0 && (
                      <div className="card-premium p-6">
                        <MiniBarChart data={dashboard.analytics.domainDistribution} label="Domain Search Distribution" />
                      </div>
                    )}

                    {/* Score Trend */}
                    {dashboard.analytics.scoreTrend && dashboard.analytics.scoreTrend.length > 0 && (
                      <div className="card-premium p-6">
                        <ScoreTrendChart data={dashboard.analytics.scoreTrend} />
                        <div className="mt-2 text-xs text-gray-400">
                          Average match score: <span className="font-medium text-gray-600">{dashboard.analytics.averageMatchScore}%</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Top Skills */}
                {dashboard.topSkills && dashboard.topSkills.length > 0 && (
                  <div className="card-premium p-7">
                    <h3 className="font-extrabold text-gray-900 mb-5 tracking-tight">Your Top Skills</h3>
                    <div className="flex flex-wrap gap-2.5">
                      {dashboard.topSkills.map((s) => (
                        <span
                          key={s.skill}
                          className="px-4 py-2 rounded-xl text-sm font-semibold border transition-all duration-200 hover:shadow-sm cursor-default"
                          style={{ background: 'linear-gradient(135deg, #eef2ff, #ede9fe)', color: '#4338ca', borderColor: '#c7d2fe' }}
                        >
                          {s.skill} ({s.count})
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recent Searches */}
                {dashboard.recentSearches && dashboard.recentSearches.length > 0 && (
                  <div className="card-premium p-7">
                    <h3 className="font-extrabold text-gray-900 mb-5 tracking-tight">Recent Searches</h3>
                    <div className="space-y-2">
                      {dashboard.recentSearches.map((s) => (
                        <div
                          key={s.id}
                          className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0"
                        >
                          <div>
                            <span className="text-sm font-medium text-gray-900">
                              {s.domain === "all" ? "All Domains" : s.domain}
                            </span>
                            <span className="text-xs text-gray-400 ml-2">
                              {s.resultCount} results via {s.source}
                            </span>
                          </div>
                          <span className="text-xs text-gray-400">
                            {new Date(s.date).toLocaleDateString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : null}
          </div>
        )}

        {/* Saved Tab */}
        {activeTab === "saved" && (
          <div className="space-y-4">
            {saved.length === 0 ? (
              <div className="text-center py-16 card-premium">
                <div className="rounded-3xl flex items-center justify-center mx-auto mb-5" style={{ width: '72px', height: '72px', background: 'linear-gradient(135deg, #eef2ff, #ede9fe)' }}>
                  <span className="text-3xl">💾</span>
                </div>
                <p className="text-gray-400 font-semibold text-base">No saved internships yet.</p>
                <Link to="/" className="inline-flex items-center gap-1.5 text-primary-600 text-sm hover:underline mt-4 font-bold">
                  Browse internships
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
                </Link>
              </div>
            ) : (
              saved.map((item) => (
                <div
                  key={item._id}
                  className="card-premium p-5 flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900">
                      {(item.internshipId as any)?.title || "Internship"}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {(item.internshipId as any)?.company} • {(item.internshipId as any)?.location}
                    </p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-green-50 text-green-700">
                        Score: {item.score}%
                      </span>
                      <span className="text-xs text-gray-400">
                        Saved {new Date(item.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemoveSaved(item._id)}
                    className="text-red-500 hover:text-red-700 text-sm font-medium"
                  >
                    Remove
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        {/* History Tab */}
        {activeTab === "history" && (
          <div className="space-y-4">
            {history.length === 0 ? (
              <div className="text-center py-16 card-premium">
                <div className="rounded-3xl flex items-center justify-center mx-auto mb-5" style={{ width: '72px', height: '72px', background: 'linear-gradient(135deg, #eef2ff, #ede9fe)' }}>
                  <span className="text-3xl">📋</span>
                </div>
                <p className="text-gray-400 font-semibold text-base">No recommendation history yet.</p>
              </div>
            ) : (
              <>
                {history.map((item: any) => (
                  <div
                    key={item._id}
                    className="card-premium p-5"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-gray-900">
                        {item.profileSnapshot?.preferred_domain || "General"} Search
                      </span>
                      <span className="text-xs text-gray-400">
                        {new Date(item.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {item.profileSnapshot?.skills?.map((s: string) => (
                        <span key={s} className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded">
                          {s}
                        </span>
                      ))}
                    </div>
                    {item.recommendations && item.recommendations.length > 0 && (
                      <div className="space-y-1">
                        {item.recommendations.slice(0, 3).map((r: any, i: number) => (
                          <div key={i} className="flex items-center justify-between text-sm">
                            <span className="text-gray-700">
                              {r.title} — {r.company}
                            </span>
                            <span className="text-primary-600 font-medium">{r.score}%</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}

                {historyPagination && historyPagination.pages > 1 && (
                  <div className="flex justify-center gap-2 mt-4">
                    {Array.from({ length: historyPagination.pages }, (_, i) => (
                      <button
                        key={i + 1}
                        onClick={() => loadHistory(i + 1)}
                        className={`px-3 py-1 rounded text-sm ${
                          historyPagination.page === i + 1
                            ? "bg-primary-600 text-white"
                            : "bg-white border border-gray-200 text-gray-600"
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Resume Tab */}
        {activeTab === "resume" && (
          <div className="space-y-6">
            <div className="card-premium p-8">
              <h3 className="font-extrabold text-gray-900 mb-2 tracking-tight">Upload Resume</h3>
              <p className="text-sm text-gray-500 mb-5 leading-relaxed">
                Upload your PDF resume and get instant AI-powered recommendations based on your
                experience and skills.
              </p>

              <label className="block cursor-pointer">
                <div className="border-2 border-dashed border-gray-200 rounded-2xl hover:border-primary-300 transition-all duration-300 p-8 text-center hover:bg-primary-50/30">
                  <div className="w-14 h-14 mx-auto mb-3 rounded-2xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #eef2ff, #ede9fe)' }}>
                    <span className="text-2xl">📄</span>
                  </div>
                  <p className="text-sm text-gray-500 font-medium">Click to upload or drag your PDF resume</p>
                  <p className="text-xs text-gray-400 mt-1">PDF format only</p>
                </div>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleResumeUpload}
                  disabled={resumeUploading}
                  className="hidden"
                />
              </label>

              {resumeUploading && (
                <div className="mt-4 flex items-center gap-2 text-primary-600">
                  <div className="w-4 h-4 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
                  <span className="text-sm">Parsing resume and generating recommendations...</span>
                </div>
              )}
            </div>

            {resumeResult && (
              <>
                {/* Extracted Profile */}
                <div className="card-premium p-6">
                  <h3 className="font-bold text-gray-900 mb-3">
                    Extracted Profile from: {resumeResult.fileName}
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Experience:</span>{" "}
                      <span className="font-medium capitalize">
                        {resumeResult.extractedProfile.experience_level}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Domain:</span>{" "}
                      <span className="font-medium">
                        {resumeResult.extractedProfile.preferred_domain}
                      </span>
                    </div>
                  </div>
                  <div className="mt-3">
                    <span className="text-sm text-gray-500">Skills Found:</span>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {resumeResult.extractedProfile.skills.map((s) => (
                        <span
                          key={s}
                          className="text-xs px-2 py-0.5 bg-green-50 text-green-700 rounded"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Resume-based Recommendations */}
                <div className="card-premium p-6">
                  <h3 className="font-bold text-gray-900 mb-4">
                    Resume-based Recommendations
                  </h3>
                  <div className="space-y-3">
                    {resumeResult.recommendations?.slice(0, 5).map((r: any) => (
                      <div
                        key={r.id || Math.random()}
                        className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0"
                      >
                        <div>
                          <p className="font-medium text-gray-900">{r.title}</p>
                          <p className="text-sm text-gray-500">
                            {r.company} • {r.location}
                          </p>
                        </div>
                        <span
                          className={`text-sm font-bold ${
                            r.score >= 70
                              ? "text-green-600"
                              : r.score >= 45
                              ? "text-yellow-600"
                              : "text-orange-600"
                          }`}
                        >
                          {r.score}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
