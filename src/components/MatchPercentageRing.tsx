import { useEffect, useState } from "react";

interface MatchPercentageRingProps {
  score: number;
}

export default function MatchPercentageRing({ score }: MatchPercentageRingProps) {
  const [animatedScore, setAnimatedScore] = useState(0);
  const size = 60;
  const strokeWidth = 4;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedScore(score);
    }, 100);
    return () => clearTimeout(timer);
  }, [score]);

  const offset = circumference - (animatedScore / 100) * circumference;

  const color =
    score >= 80 ? "#10b981" : score >= 60 ? "#6c63ff" : "#f59e0b";

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          className="fill-surface2 stroke-white/5"
          strokeWidth={strokeWidth}
        />
        {/* Fill */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference}
          className="transition-all duration-1000 ease-out"
          style={{ 
            strokeDashoffset: offset,
            filter: `drop-shadow(0 0 8px ${color}40)` 
          }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-[13px] font-display font-bold text-white leading-none">
          {animatedScore}%
        </span>
      </div>
    </div>
  );
}
