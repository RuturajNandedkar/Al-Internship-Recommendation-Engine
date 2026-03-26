import { useState, useEffect } from "react";
import { isAIAvailable } from "../services/aiService.ts";
import { TranslationContent } from "../data/translations.ts";

interface ApiKeySetupProps {
  t: TranslationContent;
  onKeySet: (success: boolean) => void;
}

export default function ApiKeySetup({ t, onKeySet }: ApiKeySetupProps) {
  const [isConfigured, setIsConfigured] = useState(isAIAvailable());

  useEffect(() => {
    // Check if AI is available (backend-connected)
    const available = isAIAvailable();
    setIsConfigured(available);
    onKeySet(available);
  }, [onKeySet]);

  return (
    <div className="rounded-3xl p-6 sm:p-7 mb-10 shadow-md bg-surface/50 border border-white/5 backdrop-blur-xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg" style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent2))', boxShadow: '0 6px 16px rgba(108, 99, 255, 0.35)' }}>
            <span className="text-white text-xl">🤖</span>
          </div>
          <div>
            <h3 className="text-base font-extrabold text-white font-display">{t.aiSetupTitle}</h3>
            <p className="text-xs text-white/40 font-medium">
              {isConfigured ? t.aiConnected : "AI is powered by the secure backend."}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {isConfigured && (
            <span className="inline-flex items-center gap-1.5 text-[10px] font-bold px-3 py-1 rounded-lg uppercase tracking-wider" style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--green)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
              <span className="w-2 h-2 bg-green rounded-full animate-pulse" />
              {t.aiActive}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
