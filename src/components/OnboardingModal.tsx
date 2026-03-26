import { useState, useEffect } from "react";

const STORAGE_KEY = "hasOnboarded";

interface Slide {
  emoji: string;
  title: string;
  body: string;
}

const slides: Slide[] = [
  {
    emoji: "🤖",
    title: "AI-Powered Matching",
    body: "Our engine analyses your skills, interests, and experience level to surface the internships where you have the strongest match — ranked by a multi-factor AI score so you can apply with confidence.",
  },
  {
    emoji: "📝",
    title: "Fill Your Profile for Best Results",
    body: "The more detail you provide — skills, preferred domain, location, and experience level — the sharper your recommendations become. Be specific: 'React' is better than 'web', 'machine learning' is better than 'AI'.",
  },
  {
    emoji: "📊",
    title: "Skill Gap Analysis",
    body: "After seeing your matches, head to Skill Gap Analysis to discover which skills to learn next. You'll get a prioritised list of gaps and curated learning resources for each one.",
  },
];

/**
 * OnboardingModal — shown once to first-time visitors.
 * Sets localStorage flag "hasOnboarded" on completion so it never reappears.
 */
export default function OnboardingModal() {
  const [visible, setVisible] = useState(false);
  const [slide, setSlide] = useState(0);

  useEffect(() => {
    if (!localStorage.getItem(STORAGE_KEY)) {
      setVisible(true);
    }
  }, []);

  if (!visible) return null;

  const isFirst = slide === 0;
  const isLast = slide === slides.length - 1;
  const current = slides[slide];

  const handleFinish = () => {
    localStorage.setItem(STORAGE_KEY, "true");
    setVisible(false);
  };

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(10, 10, 15, 0.8)", backdropFilter: "blur(12px)" }}
      role="dialog"
      aria-modal="true"
      aria-label="Welcome to the AI Internship Engine"
    >
      {/* Card */}
      <div
        className="relative w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-slideUp border border-white/10"
        style={{ background: "var(--surface)" }}
      >
        {/* Skip */}
        <button
          onClick={handleFinish}
          className="absolute top-4 right-5 text-[10px] text-white/20 hover:text-white/40 font-bold uppercase tracking-widest transition-colors"
        >
          Skip
        </button>

        {/* Slide content */}
        <div className="px-8 pt-12 pb-8 text-center">
          <div
            className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-md"
            style={{ background: "rgba(255, 255, 255, 0.05)", border: "1px solid rgba(255, 255, 255, 0.1)" }}
          >
            <span className="text-4xl">{current.emoji}</span>
          </div>

          <h2 className="text-xl font-extrabold text-white mb-3 tracking-tight font-display">
            {current.title}
          </h2>
          <p className="text-sm text-white/40 leading-relaxed max-w-xs mx-auto font-medium">
            {current.body}
          </p>
        </div>

        {/* Dots */}
        <div className="flex justify-center gap-2 pb-4">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setSlide(i)}
              className="transition-all duration-300 rounded-full"
              style={{
                width: i === slide ? "24px" : "8px",
                height: "8px",
                background:
                  i === slide
                    ? "var(--accent)"
                    : "rgba(255, 255, 255, 0.1)",
              }}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between px-8 pb-8 gap-3">
          <button
            onClick={() => setSlide((s) => s - 1)}
            disabled={isFirst}
            className="px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest text-white/20 transition-all duration-200 hover:bg-white/5 disabled:opacity-0 disabled:pointer-events-none"
          >
            ← Back
          </button>

          {isLast ? (
            <button
              onClick={handleFinish}
              className="btn-primary flex-1 py-3 rounded-2xl text-sm font-bold shadow-lg shadow-accent/20"
            >
              Get Started 🚀
            </button>
          ) : (
            <button
              onClick={() => setSlide((s) => s + 1)}
              className="btn-primary flex-1 py-3 rounded-2xl text-sm font-bold shadow-lg shadow-accent/20"
            >
              Next →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
