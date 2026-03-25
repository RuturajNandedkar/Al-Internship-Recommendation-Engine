import { TranslationContent } from "../data/translations.ts";

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
  t: TranslationContent;
}

export default function StepIndicator({ currentStep, totalSteps, t }: StepIndicatorProps) {
  const steps = [t.step1, t.step2, t.step3];

  return (
    <div className="flex items-center justify-center gap-3 mb-10">
      {steps.map((label, idx) => {
        const stepNum = idx + 1;
        const isActive = stepNum === currentStep;
        const isCompleted = stepNum < currentStep;

        return (
          <div key={idx} className="flex items-center gap-3">
            <div className="flex flex-col items-center">
              <div
                className={`w-11 h-11 rounded-2xl flex items-center justify-center text-sm font-bold transition-all duration-500 ${
                  isCompleted
                    ? "text-white shadow-lg"
                    : isActive
                    ? "text-white ring-4 ring-primary-100 shadow-lg"
                    : "bg-gray-100 text-gray-400 border-2 border-gray-200"
                }`}
                style={
                  isCompleted
                    ? { background: 'linear-gradient(135deg, #22c55e, #16a34a)', boxShadow: '0 4px 15px rgba(34, 197, 94, 0.3)' }
                    : isActive
                    ? { background: 'linear-gradient(135deg, #6366f1, #7c3aed)', boxShadow: '0 4px 15px rgba(99, 102, 241, 0.3)' }
                    : {}
                }
              >
                {isCompleted ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                ) : stepNum}
              </div>
              <span
                className={`text-xs mt-2 hidden sm:block font-semibold transition-colors duration-300 ${
                  isActive ? "text-primary-700" : isCompleted ? "text-emerald-600" : "text-gray-400"
                }`}
              >
                {label}
              </span>
            </div>
            {idx < steps.length - 1 && (
              <div
                className={`w-10 sm:w-24 h-0.5 rounded-full transition-all duration-700 -mt-5 sm:-mt-6 ${
                  isCompleted ? "" : "bg-gray-200"
                }`}
                style={isCompleted ? { background: 'linear-gradient(90deg, #22c55e, #16a34a)' } : {}}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
