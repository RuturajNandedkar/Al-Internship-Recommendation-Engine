import { useState, ChangeEvent, FormEvent } from "react";
import StepIndicator from "./StepIndicator.tsx";
import { TranslationContent } from "../data/translations.ts";
import { CandidateProfile } from "../services/aiService";

interface CandidateFormProps {
  t: TranslationContent;
  onSubmit: (formData: CandidateProfile) => void;
}

export default function CandidateForm({ t, onSubmit }: CandidateFormProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<CandidateProfile>({
    education: "",
    field: "",
    skills: [],
    sector: "all",
    locationIdx: 0,
    modeIdx: 0,
  });

  const educationKeys = Object.keys(t.educationOptions);
  const fieldKeys = Object.keys(t.fieldOptions);
  const sectorKeys = Object.keys(t.sectorOptions);

  const handleSkillToggle = (idx: number) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.includes(idx)
        ? prev.skills.filter((i) => i !== idx)
        : [...prev.skills, idx],
    }));
  };

  const handleSelectChange = (e: ChangeEvent<HTMLSelectElement>, field: keyof CandidateProfile, isNumeric: boolean = false) => {
    const value = isNumeric ? Number(e.target.value) : e.target.value;
    setFormData(p => ({ ...p, [field]: value }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const canProceedStep1 = formData.education && formData.field;
  const canProceedStep2 = formData.skills.length > 0;

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <StepIndicator currentStep={step} totalSteps={3} t={t} />

      {/* Step 1: Education */}
      {step === 1 && (
        <div className="space-y-7 animate-fadeIn">
          <div>
            <label className="block text-sm font-bold text-gray-800 mb-3.5 flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-xl flex items-center justify-center text-sm shadow-sm" style={{ background: 'linear-gradient(135deg, #eef2ff, #e0e7ff)' }}>📚</span>
              {t.educationLabel}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {educationKeys.map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setFormData((p) => ({ ...p, education: key }))}
                  className={`px-3 py-4 rounded-2xl text-sm font-medium border-2 transition-all duration-300 ${
                    formData.education === key
                      ? "border-primary-500 text-primary-700 shadow-lg"
                      : "border-gray-200/80 bg-white text-gray-600 hover:border-primary-300 hover:shadow-md"
                  }`}
                  style={formData.education === key ? { background: 'linear-gradient(135deg, #eef2ff, #ede9fe)', boxShadow: '0 4px 15px rgba(99, 102, 241, 0.15)' } : {}}
                >
                  {t.educationOptions[key]}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-800 mb-3.5 flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-xl flex items-center justify-center text-sm shadow-sm" style={{ background: 'linear-gradient(135deg, #f5f3ff, #ede9fe)' }}>🎓</span>
              {t.fieldLabel}
            </label>
            <div className="grid grid-cols-2 gap-3">
              {fieldKeys.map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setFormData((p) => ({ ...p, field: key }))}
                  className={`px-3 py-4 rounded-2xl text-sm font-medium border-2 transition-all duration-300 ${
                    formData.field === key
                      ? "border-primary-500 text-primary-700 shadow-lg"
                      : "border-gray-200/80 bg-white text-gray-600 hover:border-primary-300 hover:shadow-md"
                  }`}
                  style={formData.field === key ? { background: 'linear-gradient(135deg, #eef2ff, #ede9fe)', boxShadow: '0 4px 15px rgba(99, 102, 241, 0.15)' } : {}}
                >
                  {t.fieldOptions[key]}
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={() => setStep(2)}
            disabled={!canProceedStep1}
            className="btn-primary w-full py-4 rounded-2xl text-base disabled:cursor-not-allowed"
            style={!canProceedStep1 ? { background: '#e5e7eb', boxShadow: 'none', color: '#9ca3af', transform: 'none' } : {}}
          >
            {t.next}
          </button>
        </div>
      )}

      {/* Step 2: Skills */}
      {step === 2 && (
        <div className="space-y-7 animate-fadeIn">
          <div>
            <label className="block text-sm font-bold text-gray-800 mb-3 flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-xl flex items-center justify-center text-sm shadow-sm" style={{ background: 'linear-gradient(135deg, #fffbeb, #fef3c7)' }}>💡</span>
              {t.skillsLabel}
            </label>
            <p className="text-xs text-gray-400 mb-4 font-medium">Select all that apply (at least 1)</p>
            <div className="flex flex-wrap gap-2.5">
              {t.skillsList.map((skill, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSkillToggle(idx)}
                  className={`px-4 py-2.5 rounded-xl text-sm font-medium border-2 transition-all duration-300 ${
                    formData.skills.includes(idx)
                      ? "border-primary-500 text-white shadow-lg"
                      : "border-gray-200/80 bg-white text-gray-600 hover:border-primary-300 hover:shadow-sm"
                  }`}
                  style={formData.skills.includes(idx) ? { background: 'linear-gradient(135deg, #6366f1, #7c3aed)', boxShadow: '0 4px 15px rgba(99, 102, 241, 0.25)' } : {}}
                >
                  {formData.skills.includes(idx) && (
                    <svg className="w-3.5 h-3.5 inline mr-1.5 -mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                  {skill}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="btn-secondary flex-1 py-4 rounded-2xl text-base"
            >
              {t.back}
            </button>
            <button
              type="button"
              onClick={() => setStep(3)}
              disabled={!canProceedStep2}
              className="flex-1 btn-primary py-4 rounded-2xl text-base disabled:cursor-not-allowed"
              style={!canProceedStep2 ? { background: '#e5e7eb', boxShadow: 'none', color: '#9ca3af', transform: 'none' } : {}}
            >
              {t.next}
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Preferences */}
      {step === 3 && (
        <div className="space-y-7 animate-fadeIn">
          <div>
            <label className="block text-sm font-bold text-gray-800 mb-3.5 flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-xl flex items-center justify-center text-sm shadow-sm" style={{ background: 'linear-gradient(135deg, #eff6ff, #dbeafe)' }}>🏢</span>
              {t.sectorLabel}
            </label>
            <select
              value={formData.sector}
              onChange={(e) => handleSelectChange(e, 'sector')}
              className="input-premium"
            >
              {sectorKeys.map((key) => (
                <option key={key} value={key}>
                  {t.sectorOptions[key]}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-800 mb-3.5 flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-xl flex items-center justify-center text-sm shadow-sm" style={{ background: 'linear-gradient(135deg, #ecfdf5, #d1fae5)' }}>📍</span>
              {t.locationLabel}
            </label>
            <select
              value={formData.locationIdx}
              onChange={(e) => handleSelectChange(e, 'locationIdx', true)}
              className="input-premium"
            >
              {t.stateOptions.map((state, idx) => (
                <option key={idx} value={idx}>
                  {state}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-800 mb-3.5 flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-xl flex items-center justify-center text-sm shadow-sm" style={{ background: 'linear-gradient(135deg, #fff1f2, #fce7f3)' }}>🏠</span>
              {t.modeLabel}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {t.modeOptions.map((mode, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setFormData((p) => ({ ...p, modeIdx: idx }))}
                  className={`px-3 py-4 rounded-2xl text-sm font-medium border-2 transition-all duration-300 ${
                    formData.modeIdx === idx
                      ? "border-primary-500 text-primary-700 shadow-lg"
                      : "border-gray-200/80 bg-white text-gray-600 hover:border-primary-300 hover:shadow-md"
                  }`}
                  style={formData.modeIdx === idx ? { background: 'linear-gradient(135deg, #eef2ff, #ede9fe)', boxShadow: '0 4px 15px rgba(99, 102, 241, 0.15)' } : {}}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="btn-secondary flex-1 py-4 rounded-2xl text-base"
            >
              {t.back}
            </button>
            <button
              type="submit"
              className="flex-1 py-4 rounded-2xl font-bold text-white text-base transition-all duration-300 hover:-translate-y-1 hover:shadow-colored-lg"
              style={{ background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 40%, #7c3aed 100%)', boxShadow: '0 6px 20px rgba(99, 102, 241, 0.35)' }}
            >
              {t.findInternships}
            </button>
          </div>
        </div>
      )}
    </form>
  );
}
