import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.tsx";
import { TranslationContent } from "../data/translations.ts";

interface Language {
  code: string;
  label: string;
  flag: string;
}

const languages: Language[] = [
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "hi", label: "हिन्दी", flag: "🇮🇳" },
  { code: "ta", label: "தமிழ்", flag: "🇮🇳" },
];

interface HeaderProps {
  t: TranslationContent;
  currentLang: string;
  onLangChange: (lang: string) => void;
}

export default function Header({ t, currentLang, onLangChange }: HeaderProps) {
  const { isAuthenticated, user, logout } = useAuth();
  const [langOpen, setLangOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { name: "Find Internships", path: "/" },
    { name: "Skill Gap", path: "/skill-gap" },
    { name: "Dashboard", path: "/dashboard", protected: true },
  ];

  return (
    <>
      <header 
        className={`fixed top-0 left-0 w-full z-[100] transition-all duration-300 animate-header-entrance
          ${scrolled ? "py-3 bg-[#0a0a0f]/80 backdrop-blur-[20px] border-b border-white/10 shadow-lg" : "py-5 bg-[#0a0a0f]/40 backdrop-blur-[10px] border-b border-white/5"}
        `}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          {/* Logo Section */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="relative">
              <span className="text-2xl font-black font-display tracking-tighter text-white">
                Intern<span className="text-accent">AI</span>
              </span>
              <div className="absolute -top-1 -right-3 w-2 h-2 rounded-full bg-accent animate-pulse-glow" />
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              (!link.protected || isAuthenticated) && (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`text-[14px] font-body font-medium transition-all duration-300 hover:text-white
                    ${location.pathname === link.path ? "text-white" : "text-[#9898b0]"}
                  `}
                >
                  {link.name}
                </Link>
              )
            ))}
          </nav>

          {/* Actions Section */}
          <div className="hidden md:flex items-center gap-5">
            {/* Language Selection */}
            <div className="relative">
              <button
                onClick={() => setLangOpen(!langOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 hover:border-white/20 transition-all text-[13px] font-medium text-[#9898b0] hover:text-[#e8e8f0]"
              >
                <span>{languages.find(l => l.code === currentLang)?.flag}</span>
                <span className="uppercase">{currentLang}</span>
              </button>
              
              {langOpen && (
                <div className="absolute right-0 mt-3 p-2 rounded-2xl bg-[#12121c] border border-white/10 shadow-2xl min-w-[140px] animate-scaleIn">
                  {languages.map(lang => (
                    <button
                      key={lang.code}
                      onClick={() => { onLangChange(lang.code); setLangOpen(false); }}
                      className={`w-full text-left px-3 py-2 rounded-xl text-sm transition-all
                        ${currentLang === lang.code ? "bg-accent/10 text-accent font-bold" : "text-white/60 hover:bg-white/5 hover:text-white"}
                      `}
                    >
                      {lang.flag} {lang.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Auth Buttons */}
            <div className="h-4 w-px bg-white/10" />
            
            {isAuthenticated ? (
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-white/40">Hi, {user?.name?.split(' ')[0]}</span>
                <button 
                  onClick={logout}
                  className="text-sm font-bold text-coral/80 hover:text-coral transition-colors"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link 
                  to="/login"
                  className="px-5 py-2 text-sm font-bold text-white/70 hover:text-white rounded-xl border border-white/10 hover:bg-white/5 transition-all"
                >
                  Login
                </Link>
                <Link 
                  to="/signup"
                  className="px-5 py-2 text-sm font-bold text-white bg-accent rounded-xl hover:-translate-y-[1px] transition-all hover:shadow-[0_0_20px_rgba(108,99,255,0.4)]"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden text-white p-1"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" /></svg>
            )}
          </button>
        </div>

        {/* Mobile menu drawer */}
        <div 
          className={`fixed inset-0 z-[110] md:hidden transition-all duration-500 overflow-hidden ${mobileMenuOpen ? "pointer-events-auto" : "pointer-events-none"}`}
        >
          {/* Backdrop */}
          <div 
            className={`absolute inset-0 bg-[#0a0a0f]/60 backdrop-blur-sm transition-opacity duration-500 ${mobileMenuOpen ? "opacity-100" : "opacity-0"}`}
            onClick={() => setMobileMenuOpen(false)}
          />
          
          {/* Drawer */}
          <div 
            className={`absolute top-0 right-0 w-[280px] h-full bg-[#12121c] border-l border-white/5 shadow-2xl transition-transform duration-500 ease-out ${mobileMenuOpen ? "translate-x-0" : "translate-x-full"}`}
          >
            <div className="p-8 h-full flex flex-col">
              <div className="flex items-center justify-between mb-12">
                <span className="text-xl font-bold font-display text-white">Menu</span>
                <button onClick={() => setMobileMenuOpen(false)} className="text-white/40 hover:text-white p-2">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>

              <nav className="space-y-6 mb-12">
                {navLinks.map(link => (
                  (!link.protected || isAuthenticated) && (
                    <Link 
                      key={link.path} 
                      to={link.path} 
                      className={`block text-lg font-bold transition-colors ${location.pathname === link.path ? "text-accent" : "text-white/60 hover:text-white"}`}
                    >
                      {link.name}
                    </Link>
                  )
                ))}
              </nav>

              <div className="mt-auto space-y-4">
                {isAuthenticated ? (
                  <button onClick={logout} className="w-full py-3 rounded-2xl bg-coral/10 text-coral font-bold uppercase tracking-widest text-xs">Logout</button>
                ) : (
                  <>
                    <Link to="/login" className="block w-full py-3 rounded-2xl bg-white/5 text-center font-bold text-white hover:bg-white/10 transition-colors">Login</Link>
                    <Link to="/signup" className="block w-full py-3 rounded-2xl bg-accent text-center font-bold text-white shadow-lg shadow-accent/20">Sign Up</Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>
      {/* Spacer to prevent content from jumping under fixed header */}
      <div className="h-20" />
    </>
  );
}
