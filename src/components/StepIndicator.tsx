import { TranslationContent } from "../data/translations.ts";

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
  t: TranslationContent;
}

export default function StepIndicator({ currentStep, totalSteps, t }: StepIndicatorProps) {
  const steps = [t.step1, t.step2, t.step3];

  return (
    <div className="flex items-center justify-between max-w-md mx-auto mb-12 relative">
      {/* Connecting Lines Container (Behind) */}
      <div className="absolute top-5 left-0 w-full h-px bg-white/5 -z-10" />
      
      {steps.map((label, idx) => {
        const stepNum = idx + 1;
        const isActive = stepNum === currentStep;
        const isCompleted = stepNum < currentStep;

        return (
          <div key={idx} className="flex flex-col items-center relative gap-3">
            {/* Step Circle */}
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-mono transition-all duration-500 border
                ${isCompleted 
                  ? "bg-green border-green text-white shadow-[0_0_20px_rgba(16,185,129,0.3)]" 
                  : isActive 
                  ? "bg-accent border-accent text-white shadow-[0_0_20px_rgba(108,99,255,0.4)]" 
                  : "bg-surface2 border-white/10 text-white/20"
                }
              `}
            >
              {isCompleted ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <span className="font-bold">{stepNum}</span>
              )}
            </div>

            {/* Label */}
            <span
              className={`text-[10px] font-mono font-bold uppercase tracking-widest transition-colors duration-300 whitespace-nowrap
                ${isActive ? "text-accent" : isCompleted ? "text-green" : "text-white/20"}
              `}
            >
              {label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
