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
import Header from "../components/Header.tsx";
import { translations, TranslationContent } from "../data/translations.ts";
import { useScrollReveal } from "../hooks/useScrollReveal";


interface StatCardProps {
  label: string;
  value: string | number;
  icon: string;
  delta?: string;
  trend?: "up" | "down";
  progress?: number;
}

function StatCard({ label, value, icon, delta, trend = "up", progress = 70 }: StatCardProps) {
  return (
    <div className="reveal bg-[#12121c] border border-white/5 rounded-[24px] p-8 relative overflow-hidden group transition-all duration-300 hover:border-white/10 hover:shadow-xl">
      <div className="flex justify-between items-start mb-4">
        <span className="text-[11px] font-mono font-bold uppercase tracking-[0.1em] text-[#5a5a78]">
          {label}
        </span>
        <span className="text-xl group-hover:scale-110 transition-transform duration-300">{icon}</span>
      </div>
      
      <div className="flex items-baseline gap-3 mb-4">
        <h3 className="text-[36px] font-display font-extrabold text-[#e8e8f0] leading-none">
          {value}
        </h3>
        {delta && (
          <span className={`text-[12px] font-bold ${trend === "up" ? "text-green" : "text-coral"}`}>
            {trend === "up" ? "↑" : "↓"} {delta}
          </span>
        )}
      </div>

      {/* Mini Progress Bar */}
      <div className="w-full h-[4px] bg-white/5 rounded-full overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-accent to-accent3 rounded-full transition-all duration-1000"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

interface ProgressBarProps {
  value: number;
  size?: number;
}

function ProfileCompletenessRing({ value, size = 120 }: { value: number; size?: number }) {
  const [animatedValue, setAnimatedValue] = useState(0);
  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  
  useEffect(() => {
    const timer = setTimeout(() => setAnimatedValue(value), 100);
    return () => clearTimeout(timer);
  }, [value]);

  const offset = circumference - (animatedValue / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          className="stroke-white/5 fill-none"
          strokeWidth="6"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="url(#progressGrad)"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference}
          className="transition-all duration-1000 ease-out"
          style={{ strokeDashoffset: offset }}
        />
        <defs>
          <linearGradient id="progressGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--accent)" />
            <stop offset="100%" stopColor="var(--accent3)" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-display font-bold text-white leading-none">{animatedValue}%</span>
      </div>
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
  const colors = ["bg-accent", "bg-accent3", "bg-green", "bg-gold"];

  return (
    <div className="reveal">
      <h4 className="text-[12px] font-mono font-bold uppercase tracking-[0.1em] text-[#5a5a78] mb-6">
        {label}
      </h4>
      <div className="space-y-4">
        {data.map((item, i) => (
          <div key={item.domain} className="space-y-2">
            <div className="flex justify-between text-[13px] font-medium">
              <span className="text-white/70">{item.domain}</span>
              <span className="text-white/40">{item.percentage}%</span>
            </div>
            <div className="w-full bg-white/5 rounded-full h-[6px] overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ease-out ${colors[i % colors.length]}`}
                style={{ width: `${(item.count / max) * 100}%` }}
              />
            </div>
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
  
  const width = 400;
  const height = 100;
  const padding = 10;
  const points = data.map((d, i) => ({
    x: (i / (data.length - 1)) * (width - 2 * padding) + padding,
    y: height - (d.avgScore / 100) * (height - 2 * padding) - padding
  }));

  const pathD = `M ${points.map(p => `${p.x},${p.y}`).join(' L ')}`;
  const areaD = `${pathD} L ${points[points.length - 1].x},${height} L ${points[0].x},${height} Z`;
  const lastPoint = points[points.length - 1];

  return (
    <div className="reveal relative">
      <h4 className="text-[12px] font-mono font-bold uppercase tracking-[0.1em] text-[#5a5a78] mb-6">
        Match Score Trend
      </h4>
      <div className="h-[120px] w-full">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
          <defs>
            <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.3" />
              <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
            </linearGradient>
          </defs>
          {/* Area */}
          <path d={areaD} fill="url(#areaGrad)" />
          {/* Line */}
          <path 
            d={pathD} 
            fill="none" 
            stroke="var(--accent)" 
            strokeWidth="2.5" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
          />
          {/* Last point dot */}
          <circle 
            cx={lastPoint.x} 
            cy={lastPoint.y} 
            r="4" 
            fill="var(--accent)" 
            className="animate-pulse"
          />
        </svg>
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

  const [lang, setLang] = useState<string>("en");
  const t: TranslationContent = (translations as Record<string, TranslationContent>)[lang];

  useScrollReveal();

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
    { id: "overview", label: "Overview" },
    { id: "saved", label: "Saved" },
    { id: "history", label: "History" },
    { id: "resume", label: "Resume" },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-[#e8e8f0]">
      <Header t={t} currentLang={lang} onLangChange={setLang} />

      <main className="max-w-7xl mx-auto px-6 py-12 pt-32">
        {/* Page Header */}
        <div className="mb-12">
          <h1 className="text-[32px] font-display font-extrabold text-white leading-tight mb-2">
            Good morning, {user?.name || "Ruturaj"}
          </h1>
          <p className="text-[15px] text-[#9898b0] font-body">
            Here's what's happening with your internship search today.
          </p>
        </div>

        {error && (
          <div className="mb-8 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-medium flex items-center justify-between animate-fadeIn">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
            <button onClick={() => setError(null)} className="text-red-500 hover:text-red-400 font-semibold text-xs transition-colors">
              Dismiss
            </button>
          </div>
        )}

        {/* Tab Bar - Bottom Border Style */}
        <div className="flex items-center border-b border-white/5 mb-12 gap-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-4 text-[14px] font-bold tracking-tight transition-all duration-300 relative
                ${activeTab === tab.id ? "text-white" : "text-[#5a5a78] hover:text-white/60"}
              `}
            >
              {tab.label}
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 w-full h-[2px] bg-accent shadow-[0_0_12px_rgba(108,99,255,0.5)]" />
              )}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="space-y-8 animate-fadeIn">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
              </div>
            ) : dashboard ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  <StatCard
                    label="Saved Internships"
                    value={dashboard.stats.savedInternships}
                    icon="💾"
                    delta="12% from last week"
                    progress={65}
                  />
                  <StatCard
                    label="Total Searches"
                    value={dashboard.stats.totalSearches}
                    icon="🔍"
                    delta="4 new today"
                    progress={40}
                  />
                  <StatCard
                    label="Available Internships"
                    value={dashboard.stats.totalInternships || "1.2k"}
                    icon="🎯"
                    progress={85}
                  />
                  <StatCard
                    label="Success Rate"
                    value="94%"
                    icon="🚀"
                    delta="2% up"
                    progress={94}
                  />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Profile Completeness - Ring Design */}
                  <div className="lg:col-span-1 bg-[#12121c] border border-white/5 rounded-[20px] p-8">
                    <h3 className="text-[12px] font-mono font-bold uppercase tracking-[0.1em] text-[#5a5a78] mb-8">
                      Profile Completeness
                    </h3>
                    <div className="flex flex-col items-center">
                      <ProfileCompletenessRing value={dashboard.stats.profileCompleteness || 0} />
                      <div className="mt-8 space-y-3 w-full">
                        {[
                          { label: "Basic Information", complete: true },
                          { label: "Skills & Interests", complete: dashboard.stats.profileCompleteness >= 60 },
                          { label: "Resume Uploaded", complete: dashboard.stats.profileCompleteness >= 80 },
                        ].map((item, i) => (
                          <div key={i} className="flex items-center gap-3 text-[13px]">
                            <div className={`w-4 h-4 rounded-full flex items-center justify-center ${item.complete ? "bg-green/10 text-green" : "bg-white/5 text-white/20"}`}>
                              {item.complete ? "✓" : ""}
                            </div>
                            <span className={item.complete ? "text-white/70" : "text-white/30"}>{item.label}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Analytics Section */}
                  <div className="lg:col-span-2 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Domain Distribution */}
                      <div className="bg-[#12121c] border border-white/5 rounded-[20px] p-8">
                        <MiniBarChart data={dashboard.analytics?.domainDistribution || []} label="Top Match Categories" />
                      </div>

                      {/* Score Trend */}
                      <div className="bg-[#12121c] border border-white/5 rounded-[20px] p-8">
                        <ScoreTrendChart data={dashboard.analytics?.scoreTrend || []} />
                      </div>
                    </div>

                    {/* Top Skills */}
                    <div className="bg-[#12121c] border border-white/5 rounded-[20px] p-8">
                      <h3 className="text-[12px] font-mono font-bold uppercase tracking-[0.1em] text-[#5a5a78] mb-6">
                        Top Matched Skills
                      </h3>
                      <div className="flex flex-wrap gap-3">
                        {dashboard.topSkills?.map((s) => (
                          <span
                            key={s.skill}
                            className="px-4 py-2 rounded-xl text-[13px] font-bold bg-white/[0.03] border border-white/5 text-accent2 transition-all hover:border-accent/20"
                          >
                            {s.skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : null}
          </div>
        )}

        {/* Saved Tab */}
        {activeTab === "saved" && (
          <div className="space-y-4 animate-fadeIn">
            {saved.length === 0 ? (
              <div className="text-center py-20 bg-[#12121c] border border-white/5 rounded-[20px]">
                <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/10">
                  <span className="text-3xl">💾</span>
                </div>
                <p className="text-[#9898b0] font-medium">No saved internships yet.</p>
                <Link to="/" className="text-accent hover:text-accent3 font-bold text-sm mt-4 inline-block transition-colors">
                  Browse internships →
                </Link>
              </div>
            ) : (
              saved.map((item) => (
                <div key={item._id} className="bg-[#12121c] border border-white/5 rounded-[16px] p-6 flex items-center justify-between group hover:border-white/10 transition-all">
                  <div className="flex items-center gap-6">
                    <div className="w-12 h-12 rounded-xl bg-surface2 flex items-center justify-center border border-white/5 font-display font-bold text-lg text-accent">
                      {((item.internshipId as any)?.company || "C").charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-display font-bold text-[16px] text-white">
                        {(item.internshipId as any)?.title || "Internship"}
                      </h3>
                      <p className="text-[13px] text-[#9898b0] mt-1">
                        {(item.internshipId as any)?.company} • {(item.internshipId as any)?.location}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <span className="text-[14px] font-bold text-green">{item.score}% Match</span>
                      <p className="text-[11px] text-[#5a5a78] font-mono uppercase mt-1">Saved {new Date(item.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="px-4 py-2 rounded-lg bg-white/5 text-white/70 text-[13px] font-bold hover:bg-white/10 transition-all">
                        View
                      </button>
                      <button 
                        onClick={() => handleRemoveSaved(item._id)}
                        className="p-2 rounded-lg text-coral/50 hover:text-coral hover:bg-coral/10 transition-all"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* History Tab */}
        {activeTab === "history" && (
          <div className="space-y-4 animate-fadeIn">
            {history.length === 0 ? (
              <div className="text-center py-20 bg-[#12121c] border border-white/5 rounded-[20px]">
                <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/10">
                  <span className="text-3xl">📋</span>
                </div>
                <p className="text-[#9898b0] font-medium">No recommendation history yet.</p>
              </div>
            ) : (
              <>
                {history.map((item: any) => (
                  <div key={item._id} className="bg-[#12121c] border border-white/5 rounded-[16px] p-6 hover:border-white/10 transition-all">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <span className="text-[11px] font-mono font-bold uppercase tracking-[0.1em] text-[#5a5a78]">
                          {new Date(item.createdAt).toLocaleString()}
                        </span>
                        <h4 className="text-[16px] font-display font-bold text-white mt-1">
                          {item.profileSnapshot?.preferred_domain || "Software Engineering"} Search
                        </h4>
                      </div>
                      <div className="flex -space-x-2">
                        {item.recommendations?.slice(0, 3).map((r: any, i: number) => (
                          <div key={i} className="w-8 h-8 rounded-full bg-surface2 border-2 border-[#12121c] flex items-center justify-center text-[10px] font-bold text-accent">
                            {r.company?.charAt(0)}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {item.profileSnapshot?.skills?.slice(0, 5).map((s: string) => (
                        <span key={s} className="px-2.5 py-1 rounded-md bg-white/[0.03] text-white/40 text-[11px] font-bold border border-white/5">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}

                {historyPagination && historyPagination.pages > 1 && (
                  <div className="flex justify-center gap-2 mt-8">
                    {Array.from({ length: historyPagination.pages }, (_, i) => (
                      <button
                        key={i + 1}
                        onClick={() => loadHistory(i + 1)}
                        className={`w-10 h-10 rounded-xl font-bold transition-all
                          ${historyPagination.page === i + 1 
                            ? "bg-accent text-white shadow-lg shadow-accent/20" 
                            : "bg-white/5 text-[#5a5a78] hover:text-white hover:bg-white/10"}
                        `}
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
          <div className="space-y-8 animate-fadeIn">
            <div className="bg-[#12121c] border border-white/5 rounded-[20px] p-8">
              <h3 className="text-[18px] font-display font-bold text-white mb-2">Upload Resume</h3>
              <p className="text-[14px] text-[#9898b0] mb-8 max-w-lg">
                Upload your PDF resume to let our AI analyze your profile and find the most relevant internship opportunities.
              </p>

              <label className="block group">
                <div className="border-2 border-dashed border-white/10 rounded-[20px] p-12 text-center transition-all duration-300 group-hover:border-accent group-hover:bg-accent/5 cursor-pointer">
                  <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/10 group-hover:scale-110 transition-transform">
                    <span className="text-3xl">📄</span>
                  </div>
                  <p className="text-[15px] text-white/70 font-bold">Select PDF resume</p>
                  <p className="text-[12px] text-white/30 mt-2 font-medium">Maximum file size: 5MB</p>
                </div>
                <input type="file" accept=".pdf" onChange={handleResumeUpload} disabled={resumeUploading} className="hidden" />
              </label>

              {resumeUploading && (
                <div className="mt-6 flex items-center justify-center gap-3 text-accent font-bold text-sm">
                  <div className="w-5 h-5 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                  Parsing your career timeline...
                </div>
              )}
            </div>

            {resumeResult && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Extracted Profile Details */}
                <div className="bg-[#12121c] border border-white/5 rounded-[20px] p-8">
                  <h4 className="text-[12px] font-mono font-bold uppercase tracking-[0.1em] text-[#5a5a78] mb-6">
                    Insights from {resumeResult.fileName}
                  </h4>
                  <div className="space-y-6">
                    <div className="flex gap-12">
                      <div>
                        <p className="text-[11px] text-white/30 font-bold uppercase mb-1">Experience</p>
                        <p className="text-[16px] text-white font-bold capitalize">{resumeResult.extractedProfile.experience_level}</p>
                      </div>
                      <div>
                        <p className="text-[11px] text-white/30 font-bold uppercase mb-1">Domain</p>
                        <p className="text-[16px] text-white font-bold">{resumeResult.extractedProfile.preferred_domain}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-[11px] text-white/30 font-bold uppercase mb-3">Extracted Skills</p>
                      <div className="flex flex-wrap gap-2">
                        {resumeResult.extractedProfile.skills.map((s) => (
                          <span key={s} className="px-3 py-1.5 rounded-lg bg-green/10 text-green text-[12px] font-bold border border-green/20">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* AI Recommendations for Resume */}
                <div className="bg-[#12121c] border border-white/5 rounded-[20px] p-8">
                  <h4 className="text-[12px] font-mono font-bold uppercase tracking-[0.1em] text-[#5a5a78] mb-6">
                    AI Top Recommendations
                  </h4>
                  <div className="space-y-4">
                    {resumeResult.recommendations?.slice(0, 4).map((r: any) => (
                      <div key={r.id || Math.random()} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0 hover:bg-white/[0.02] -mx-2 px-2 rounded-lg transition-colors">
                        <div>
                          <p className="text-[14px] font-bold text-white mb-1">{r.title}</p>
                          <p className="text-[12px] text-[#9898b0]">{r.company}</p>
                        </div>
                        <span className="text-[14px] font-display font-extrabold text-accent">{r.score}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
