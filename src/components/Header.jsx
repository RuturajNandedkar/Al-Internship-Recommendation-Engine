import { useState } from "react";

const languages = [
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "hi", label: "हिन्दी", flag: "🇮🇳" },
  { code: "ta", label: "தமிழ்", flag: "🇮🇳" },
];

export default function Header({ t, currentLang, onLangChange }) {
  const [langOpen, setLangOpen] = useState(false);

  return (
    <header className="header-gradient text-white shadow-xl relative z-10">
      {/* Subtle top accent line */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />

      <div className="max-w-5xl mx-auto px-5 py-5 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-xl font-bold backdrop-blur-md border border-white/15 shadow-lg shadow-black/10 transition-transform duration-300 hover:scale-105 hover:bg-white/15">
            🎯
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-extrabold leading-tight tracking-tight">{t.appTitle}</h1>
            <p className="text-xs sm:text-sm text-indigo-200/70 font-light tracking-wide">{t.appSubtitle}</p>
          </div>
        </div>

        {/* Language selector */}
        <div className="relative">
          <button
            onClick={() => setLangOpen(!langOpen)}
            className="flex items-center gap-2.5 bg-white/8 hover:bg-white/15 px-4 py-2.5 rounded-2xl text-sm transition-all duration-300 backdrop-blur-md border border-white/10 hover:border-white/20 hover:shadow-lg hover:shadow-black/5"
            aria-label={t.languageLabel}
          >
            <span className="text-base">{languages.find((l) => l.code === currentLang)?.flag}</span>
            <span className="hidden sm:inline font-medium text-white/90">
              {languages.find((l) => l.code === currentLang)?.label}
            </span>
            <svg className={`w-4 h-4 text-white/60 transition-transform duration-300 ${langOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {langOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setLangOpen(false)} />
              <div className="absolute right-0 mt-3 rounded-2xl shadow-premium-lg overflow-hidden z-50 min-w-[180px] animate-scaleIn border border-gray-100/50" style={{ background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(20px)' }}>
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      onLangChange(lang.code);
                      setLangOpen(false);
                    }}
                    className={`w-full text-left px-4 py-3.5 text-sm flex items-center gap-3 transition-all duration-200 ${
                      currentLang === lang.code
                        ? "bg-primary-50 font-semibold text-primary-700"
                        : "text-gray-700 hover:bg-primary-50/60"
                    }`}
                  >
                    <span className="text-lg">{lang.flag}</span>
                    <span>{lang.label}</span>
                    {currentLang === lang.code && (
                      <svg className="w-4 h-4 ml-auto text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Bottom edge gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
    </header>
  );
}
