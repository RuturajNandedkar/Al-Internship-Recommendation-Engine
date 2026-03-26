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
    <div className="rounded-3xl p-6 sm:p-7 mb-10 shadow-md" style={{ background: 'linear-gradient(135deg, rgba(238,242,255,0.9), rgba(237,233,254,0.9), rgba(219,234,254,0.9))', border: '1px solid rgba(199, 210, 254, 0.5)', backdropFilter: 'blur(12px)' }}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg" style={{ background: 'linear-gradient(135deg, #6366f1, #7c3aed)', boxShadow: '0 6px 16px rgba(99, 102, 241, 0.35)' }}>
            <span className="text-white text-xl">🤖</span>
          </div>
          <div>
            <h3 className="text-base font-extrabold text-indigo-900">{t.aiSetupTitle}</h3>
            <p className="text-xs text-indigo-500 font-medium">
              {isConfigured ? t.aiConnected : "AI is powered by the secure backend."}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {isConfigured && (
            <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-lg" style={{ background: 'linear-gradient(135deg, #dcfce7, #bbf7d0)', color: '#15803d', border: '1px solid #86efac' }}>
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              {t.aiActive}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
