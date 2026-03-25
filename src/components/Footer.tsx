import { TranslationContent } from "../data/translations.ts";

interface FooterProps {
  t: TranslationContent;
}

export default function Footer({ t }: FooterProps) {
  return (
    <footer className="mt-16 relative overflow-hidden">
      {/* Gradient fade-in at top */}
      <div className="absolute inset-0 bg-gradient-to-t from-primary-950/5 via-primary-900/3 to-transparent pointer-events-none" />

      <div className="border-t border-gray-200/40 relative">
        <div className="max-w-5xl mx-auto px-5 py-10">
          <div className="flex flex-col items-center gap-4">
            {/* Brand */}
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center text-base" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', boxShadow: '0 4px 12px rgba(99, 102, 241, 0.25)' }}>
                <span className="text-white">🎯</span>
              </div>
              <span className="text-sm font-bold text-gray-800 tracking-tight">InternMatch AI</span>
            </div>

            {/* Divider */}
            <div className="w-12 h-[2px] rounded-full bg-gradient-to-r from-primary-300 to-accent-300" />

            {/* Text */}
            <div className="text-center space-y-1">
              <p className="text-xs text-gray-400 font-medium">{t.poweredBy}</p>
              <p className="text-xs text-gray-400">{t.footer}</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
