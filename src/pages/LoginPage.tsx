import { useState, FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.tsx";

export default function LoginPage() {
  const { login, loading, error, clearError } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    clearError();
    try {
      await login(email, password);
      navigate("/dashboard");
    } catch {
      // error is set in context
    }
  };

  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#0a0a0f] overflow-hidden">
      {/* Left Panel - Decorative (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-[#12121c] items-center justify-center p-12 overflow-hidden border-r border-white/5">
        {/* Animated Orbs */}
        <div className="absolute top-[-100px] left-[-100px] w-[400px] h-[400px] bg-accent/10 rounded-full blur-[120px] animate-float-hero"></div>
        <div className="absolute bottom-[-50px] right-[-50px] w-[300px] h-[300px] bg-accent3/10 rounded-full blur-[100px] animate-pulse-glow"></div>
        
        <div className="relative z-10 max-w-lg">
          <Link to="/" className="inline-flex items-center gap-3 mb-12 group">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-accent to-accent2 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
              <span className="text-2xl">🎯</span>
            </div>
            <span className="text-2xl font-display font-black text-white tracking-tighter">InternAI</span>
          </Link>

          <h1 className="text-[56px] font-display font-bold text-white leading-[1.1] mb-8 tracking-tight">
            Elevate your <br/><span className="text-gradient">career trajectory</span> with AI.
          </h1>

          <div className="space-y-6">
            {[
              "Personalized internship matching",
              "AI-powered skill gap analysis",
              "Automated resume optimization",
              "Direct access to top hiring partners"
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-4 group cursor-default">
                <div className="w-6 h-6 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                  <svg className="w-3.5 h-3.5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-[16px] text-[#9898b0] font-medium">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Abstract Pattern Overlay */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>
      </div>

      {/* Right Panel - Form Center */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 relative">
        <div className="w-full max-w-[420px] animate-fadeIn">
          <div className="mb-10 lg:hidden">
            <Link to="/" className="inline-flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center text-sm">🎯</div>
              <span className="font-display font-bold text-white">InternAI</span>
            </Link>
          </div>

          <header className="mb-10">
            <h2 className="text-[36px] font-display font-bold text-white mb-3">Welcome back</h2>
            <p className="text-[#5a5a78] font-medium">Continue your journey to the perfect internship.</p>
          </header>

          {error && (
            <div className="mb-8 p-4 rounded-2xl bg-coral/10 border border-coral/20 text-coral text-sm font-bold flex items-center gap-3 animate-shake">
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[12px] font-mono font-bold uppercase tracking-widest text-[#5a5a78] pl-1">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#1a1a28] border border-white/5 rounded-2xl px-5 py-4 text-white placeholder:text-white/10 focus:outline-none focus:border-accent/50 focus:ring-4 focus:ring-accent/10 transition-all"
                placeholder="name@company.com"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-end pl-1">
                <label className="text-[12px] font-mono font-bold uppercase tracking-widest text-[#5a5a78]">Password</label>
                <button type="button" className="text-[11px] font-bold text-accent hover:text-accent2 transition-colors">Forgot Password?</button>
              </div>
              <div className="relative group">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#1a1a28] border border-white/5 rounded-2xl px-5 py-4 text-white placeholder:text-white/10 focus:outline-none focus:border-accent/50 focus:ring-4 focus:ring-accent/10 transition-all pr-12"
                  placeholder="••••••••"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#5a5a78] hover:text-white transition-colors p-1"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18"/></svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-accent to-accent2 hover:from-accent2 hover:to-accent text-white font-display font-bold py-4 rounded-2xl shadow-xl shadow-accent/20 hover:shadow-accent/30 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:translate-y-0"
            >
              {loading ? "Verifying..." : "Sign In"}
            </button>
          </form>

          <div className="mt-8 flex items-center gap-4">
            <div className="h-[1px] flex-1 bg-white/5"></div>
            <span className="text-[11px] font-mono font-bold text-[#5a5a78] uppercase tracking-widest">or continue with</span>
            <div className="h-[1px] flex-1 bg-white/5"></div>
          </div>

          <div className="mt-8">
            <button className="w-full bg-[#1a1a28] border border-white/5 hover:border-white/10 rounded-2xl py-4 flex items-center justify-center gap-3 transition-all">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 12-5.38z"/>
              </svg>
              <span className="text-white font-bold">Google</span>
            </button>
          </div>

          <p className="mt-10 text-center text-[#5a5a78] font-medium">
            Don't have an account?{" "}
            <Link to="/signup" className="text-accent2 hover:underline underline-offset-4 decoration-accent2/30 transition-all font-bold">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
