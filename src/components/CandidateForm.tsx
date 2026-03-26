import { useState, ChangeEvent, FormEvent, useRef, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import StepIndicator from "./StepIndicator.tsx";
import { TranslationContent } from "../data/translations.ts";
import { CandidateProfile } from "../services/aiService";

interface CandidateFormProps {
  t: TranslationContent;
  onSubmit: (formData: CandidateProfile) => void;
}

export default function CandidateForm({ t, onSubmit }: CandidateFormProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const step = parseInt(searchParams.get("step") || "1");

  const setStep = (s: number) => {
    setSearchParams(prev => {
      prev.set("step", s.toString());
      return prev;
    });
    // Smooth scroll to top of form
    document.getElementById('matching-form')?.scrollIntoView({ behavior: 'smooth' });
  };
  const [formData, setFormData] = useState<CandidateProfile>({
    education: "",
    field: "",
    skills: [],
    sector: "all",
    locationIdx: 0,
    modeIdx: 0,
  });
  const [dragActive, setDragActive] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  // Mock file upload handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFileName(e.dataTransfer.files[0].name);
    }
  };

  const canProceedStep1 = formData.education && formData.field;
  const canProceedStep2 = formData.skills.length > 0;

  const inputClasses = "w-full bg-[#1a1a28] border border-white/10 rounded-[10px] px-[18px] py-[14px] text-[#e8e8f0] font-body text-[15px] outline-none transition-all focus:border-accent focus:shadow-[0_0_0_3px_rgba(108,99,255,0.15)] appearance-none";
  const labelClasses = "block text-[12px] font-mono font-bold uppercase tracking-[0.15em] text-[#9898b0] mb-3";

  return (
    <div className="bg-[#12121c] border border-white/5 rounded-[24px] p-8 md:p-12 shadow-[0_40px_80px_rgba(0,0,0,0.5)] relative overflow-hidden">
      {/* Background radial accent */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-accent/5 rounded-full blur-[100px] -mr-48 -mt-48 pointer-events-none" />

      <form onSubmit={handleSubmit} className="relative z-10 space-y-10">
        <StepIndicator currentStep={step} totalSteps={3} t={t} />

        {/* Step 1: Education & Field */}
        {step === 1 && (
          <div className="space-y-10 animate-fadeIn">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div>
                <label className={labelClasses}>{t.educationLabel}</label>
                <div className="relative">
                  <select
                    value={formData.education}
                    onChange={(e) => handleSelectChange(e, 'education')}
                    className={inputClasses}
                  >
                    <option value="" disabled className="text-white/20">Select attainment</option>
                    {educationKeys.map((key) => (
                      <option key={key} value={key} className="bg-[#1a1a28]">
                        {t.educationOptions[key]}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-white/20">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                  </div>
                </div>
              </div>

              <div>
                <label className={labelClasses}>{t.fieldLabel}</label>
                <div className="relative">
                  <select
                    value={formData.field}
                    onChange={(e) => handleSelectChange(e, 'field')}
                    className={inputClasses}
                  >
                    <option value="" disabled>Select domain</option>
                    {fieldKeys.map((key) => (
                      <option key={key} value={key} className="bg-[#1a1a28]">
                        {t.fieldOptions[key]}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-white/20">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Resume Upload Zone */}
            <div>
              <label className={labelClasses}>Quick Match via Resume (Optional)</label>
              <div 
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`relative group cursor-pointer border-2 border-dashed rounded-2xl p-10 text-center transition-all duration-300
                  ${dragActive ? "border-accent bg-accent/5" : "border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]"}
                `}
              >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  onChange={(e) => e.target.files && setFileName(e.target.files[0].name)}
                />
                <div className="flex flex-col items-center gap-4">
                  <div className="w-[52px] h-[52px] rounded-xl bg-accent/10 flex items-center justify-center text-accent group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                  </div>
                  <div>
                    <h4 className="text-[#e8e8f0] font-bold text-base">{fileName || "Drop your resume here"}</h4>
                    <p className="text-[#9898b0] text-sm mt-1">PDF, DOCX up to 10MB</p>
                  </div>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setStep(2)}
              disabled={!canProceedStep1}
              className="w-full py-5 rounded-2xl bg-accent text-white font-display font-bold text-lg shadow-[0_8px_32px_rgba(108,99,255,0.3)] hover:-translate-y-0.5 transition-all disabled:opacity-30 disabled:translate-y-0"
            >
              {t.next}
            </button>
          </div>
        )}

        {/* Step 2: Skills Selection */}
        {step === 2 && (
          <div className="space-y-10 animate-fadeIn">
            <div>
              <label className={labelClasses}>{t.skillsLabel}</label>
              <div className="flex flex-wrap gap-2.5">
                {t.skillsList.map((skill, idx) => {
                  const isSelected = formData.skills.includes(idx);
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSkillToggle(idx)}
                      className={`flex items-center gap-2.5 px-5 py-3 rounded-xl border font-bold text-sm transition-all duration-300
                        ${isSelected 
                          ? "bg-accent/15 border-accent/40 text-accent2 shadow-[0_4px_12px_rgba(108,99,255,0.15)]" 
                          : "bg-white/[0.03] border-white/5 text-white/40 hover:border-white/10 hover:text-white/60"}
                      `}
                    >
                      {skill}
                      {isSelected && (
                        <span className="w-4 h-4 flex items-center justify-center bg-accent text-white rounded-full">
                          <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex gap-6 mt-12">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex-1 py-5 rounded-2xl border border-white/10 text-white font-bold hover:bg-white/5 transition-all text-sm uppercase tracking-widest font-mono"
              >
                {t.back}
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                disabled={!canProceedStep2}
                className="flex-1 py-5 rounded-2xl bg-accent text-white font-display font-bold text-base shadow-[0_8px_32px_rgba(108,99,255,0.3)] hover:-translate-y-0.5 transition-all disabled:opacity-30 disabled:translate-y-0"
              >
                {t.next} →
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Logistics */}
        {step === 3 && (
          <div className="space-y-10 animate-fadeIn">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div>
                <label className={labelClasses}>{t.sectorLabel}</label>
                <div className="relative">
                  <select
                    value={formData.sector}
                    onChange={(e) => handleSelectChange(e, 'sector')}
                    className={inputClasses}
                  >
                    {sectorKeys.map((key) => (
                      <option key={key} value={key} className="bg-[#1a1a28]">
                        {t.sectorOptions[key]}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-white/20">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                  </div>
                </div>
              </div>

              <div>
                <label className={labelClasses}>{t.locationLabel}</label>
                <div className="relative">
                  <select
                    value={formData.locationIdx}
                    onChange={(e) => handleSelectChange(e, 'locationIdx', true)}
                    className={inputClasses}
                  >
                    {t.stateOptions.map((state, idx) => (
                      <option key={idx} value={idx} className="bg-[#1a1a28]">
                        {state}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-white/20">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label className={labelClasses}>{t.modeLabel}</label>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {t.modeOptions.map((mode, idx) => {
                  const isSelected = formData.modeIdx === idx;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setFormData((p) => ({ ...p, modeIdx: idx }))}
                      className={`px-4 py-4 rounded-xl border text-sm font-bold transition-all duration-300
                        ${isSelected 
                          ? "bg-accent/15 border-accent text-white shadow-[0_4px_12px_rgba(108,99,255,0.2)]" 
                          : "bg-white/[0.03] border-white/5 text-white/40 hover:border-white/10 hover:text-white/60"}
                      `}
                    >
                      {mode}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex gap-6 mt-12">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="flex-1 py-5 rounded-2xl border border-white/10 text-white font-bold hover:bg-white/5 transition-all text-sm uppercase tracking-widest font-mono"
              >
                {t.back}
              </button>
              <button
                type="submit"
                className="flex-1 py-5 rounded-2xl bg-gradient-to-r from-accent to-[#8b7cf8] text-white font-display font-bold text-base shadow-[0_8px_32px_rgba(108,99,255,0.3)] hover:-translate-y-0.5 transition-all"
              >
                {t.findInternships}
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
