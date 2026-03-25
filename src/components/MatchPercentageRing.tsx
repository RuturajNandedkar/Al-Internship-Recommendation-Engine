interface MatchPercentageRingProps {
  score: number;
  size?: number;
  strokeWidth?: number;
}

export default function MatchPercentageRing({ score, size = 80, strokeWidth = 6 }: MatchPercentageRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const color =
    score >= 70
      ? { stroke: "url(#gradGreen)", bg: "#f0fdf4", text: "#15803d", label: "Excellent", trackColor: "#dcfce7", glow: "rgba(34, 197, 94, 0.15)" }
      : score >= 45
      ? { stroke: "url(#gradYellow)", bg: "#fefce8", text: "#a16207", label: "Good", trackColor: "#fef9c3", glow: "rgba(234, 179, 8, 0.15)" }
      : { stroke: "url(#gradOrange)", bg: "#fff7ed", text: "#c2410c", label: "Fair", trackColor: "#fed7aa", glow: "rgba(249, 115, 22, 0.15)" };

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size, filter: `drop-shadow(0 0 8px ${color.glow})` }}>
        <svg width={size} height={size} className="transform -rotate-90">
          <defs>
            <linearGradient id="gradGreen" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#22c55e" />
              <stop offset="100%" stopColor="#16a34a" />
            </linearGradient>
            <linearGradient id="gradYellow" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#eab308" />
              <stop offset="100%" stopColor="#ca8a04" />
            </linearGradient>
            <linearGradient id="gradOrange" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f97316" />
              <stop offset="100%" stopColor="#ea580c" />
            </linearGradient>
          </defs>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color.trackColor}
            strokeWidth={strokeWidth}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color.stroke}
            strokeWidth={strokeWidth + 1}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="match-ring-animate"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-lg font-extrabold leading-none tracking-tight" style={{ color: color.text }}>
            {score}%
          </span>
        </div>
      </div>
      <span className="text-[10px] font-extrabold tracking-widest uppercase" style={{ color: color.text }}>
        {color.label}
      </span>
    </div>
  );
}
