import { useState } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { setApiKey, getApiKey } from "../services/aiService.ts";
import { TranslationContent } from "../data/translations.ts";

interface ApiKeySetupProps {
  t: TranslationContent;
  onKeySet: (success: boolean) => void;
}

export default function ApiKeySetup({ t, onKeySet }: ApiKeySetupProps) {
  const [key, setKey] = useState(getApiKey() || "");
  const [show, setShow] = useState(false);
  const [testing, setTesting] = useState(false);
  const [status, setStatus] = useState<"success" | "error" | null>(null);

  const handleSave = async () => {
    if (!key.trim()) return;
    setTesting(true);
    setStatus(null);

    try {
      // Test the key with a simple request
      const testAI = new GoogleGenerativeAI(key.trim());
      const testModel = testAI.getGenerativeModel({ model: "gemini-2.0-flash" });
      await testModel.generateContent("Reply with just the word OK");

      setApiKey(key.trim());
      setStatus("success");
      onKeySet(true);
    } catch {
      setStatus("error");
      onKeySet(false);
    }
    setTesting(false);
  };

  const isConfigured = !!getApiKey() && getApiKey() !== "your_gemini_api_key_here";

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
              {isConfigured ? t.aiConnected : t.aiSetupDesc}
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
          <button
            onClick={() => setShow(!show)}
            className="text-xs text-indigo-600 hover:text-indigo-800 font-bold underline transition-colors duration-200"
          >
            {show ? t.aiHide : isConfigured ? t.aiChange : t.aiConfigure}
          </button>
        </div>
      </div>

      {show && (
        <div className="mt-5 space-y-4 animate-fadeIn">
          <div>
            <label className="block text-xs font-bold text-indigo-800 mb-1.5">
              {t.aiKeyLabel}
            </label>
            <div className="flex gap-2.5">
              <input
                type="password"
                value={key}
                onChange={(e) => {
                  setKey(e.target.value);
                  setStatus(null);
                }}
                placeholder="AIza..."
                className="flex-1 px-4 py-3 text-sm border-2 border-indigo-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 outline-none bg-white transition-all duration-300 font-medium"
              />
              <button
                onClick={handleSave}
                disabled={!key.trim() || testing}
                className="px-6 py-3 text-white text-sm font-bold rounded-xl disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-300"
                style={(!key.trim() || testing) ? {} : { background: 'linear-gradient(135deg, #6366f1, #4f46e5)', boxShadow: '0 4px 12px rgba(79, 70, 229, 0.35)' }}
              >
                {testing ? (
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                ) : t.aiConnect}
              </button>
            </div>
          </div>

          {status === "success" && (
            <p className="text-xs font-semibold px-4 py-2.5 rounded-xl" style={{ background: 'linear-gradient(135deg, #dcfce7, #bbf7d0)', color: '#15803d', border: '1px solid #86efac' }}>
              ✅ {t.aiSuccess}
            </p>
          )}
          {status === "error" && (
            <p className="text-xs font-semibold px-4 py-2.5 rounded-xl" style={{ background: 'linear-gradient(135deg, #fef2f2, #fecaca)', color: '#dc2626', border: '1px solid #fca5a5' }}>
              ❌ {t.aiError}
            </p>
          )}

          <p className="text-xs text-indigo-500 font-medium">
            {t.aiKeyHint}{" "}
            <a
              href="https://aistudio.google.com/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="underline font-bold hover:text-indigo-700 transition-colors"
            >
              aistudio.google.com/apikey
            </a>
          </p>
        </div>
      )}
    </div>
  );
}
