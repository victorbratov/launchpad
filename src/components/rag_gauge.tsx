type RAGProps = {
  ragScore: "Red" | "Amber" | "Green";
};

export function RAGGauge({ ragScore }: RAGProps) {
  const percentage =
    ragScore === "Red" ? 30 : ragScore === "Amber" ? 65 : 100;

  const color =
    ragScore === "Red"
      ? "#ef4444" // red-500
      : ragScore === "Amber"
        ? "#f59e0b" // amber-500
        : "#22c55e"; // green-500

  const radius = 60;
  const strokeWidth = 12;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <svg width="150" height="150" className="-rotate-90">
        {/* Background circle */}
        <circle
          cx="75"
          cy="75"
          r={radius}
          stroke="#e5e7eb"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        {/* Progress circle */}
        <circle
          cx="75"
          cy="75"
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <p className="mt-2 font-semibold" style={{ color }}>
        {ragScore === "Red" && "High Risk"}
        {ragScore === "Amber" && "Medium Risk"}
        {ragScore === "Green" && "Low Risk"}
      </p>
    </div>
  );
}
