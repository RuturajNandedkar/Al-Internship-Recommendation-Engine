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
      style={{ background: "rgba(15, 23, 42, 0.55)", backdropFilter: "blur(6px)" }}
      role="dialog"
      aria-modal="true"
      aria-label="Welcome to the AI Internship Engine"
    >
      {/* Card */}
      <div
        className="relative w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-slideUp"
        style={{ background: "linear-gradient(160deg, #ffffff, #f8faff)" }}
      >
        {/* Skip */}
        <button
          onClick={handleFinish}
          className="absolute top-4 right-5 text-xs text-gray-400 hover:text-gray-600 font-semibold transition-colors"
        >
          Skip
        </button>

        {/* Slide content */}
        <div className="px-8 pt-12 pb-8 text-center">
          <div
            className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-md"
            style={{ background: "linear-gradient(135deg, #eef2ff, #ede9fe)" }}
          >
            <span className="text-4xl">{current.emoji}</span>
          </div>

          <h2 className="text-xl font-extrabold text-gray-900 mb-3 tracking-tight">
            {current.title}
          </h2>
          <p className="text-sm text-gray-500 leading-relaxed max-w-xs mx-auto">
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
                    ? "linear-gradient(135deg, #6366f1, #8b5cf6)"
                    : "#e2e8f0",
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
            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-gray-500 transition-all duration-200 hover:bg-gray-100 disabled:opacity-0 disabled:pointer-events-none"
          >
            ← Back
          </button>

          {isLast ? (
            <button
              onClick={handleFinish}
              className="btn-primary flex-1 py-3 rounded-2xl text-sm font-bold"
            >
              Get Started 🚀
            </button>
          ) : (
            <button
              onClick={() => setSlide((s) => s + 1)}
              className="btn-primary flex-1 py-3 rounded-2xl text-sm font-bold"
            >
              Next →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
