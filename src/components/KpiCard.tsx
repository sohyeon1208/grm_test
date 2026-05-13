type Props = {
  label: string;
  value: string;
  trend?: "positive" | "negative" | "neutral";
  trendValue?: string;
  highlightValue?: boolean; // value 자체를 trend 색상으로 강조
};

export default function KpiCard({ label, value, trend, trendValue, highlightValue }: Props) {
  const trendColor =
    trend === "positive"
      ? "text-emerald-400"
      : trend === "negative"
      ? "text-pink-400"
      : "text-white/50";

  const trendSymbol =
    trend === "positive" ? "▲" : trend === "negative" ? "▼" : "";

  const valueColor = highlightValue
    ? trend === "positive"
      ? "#34d399"   // emerald-400
      : trend === "negative"
      ? "#f472b6"   // pink-400
      : "rgba(255,255,255,0.87)"
    : "rgba(255,255,255,0.87)";

  return (
    <div className="bg-[#1C1E2E] rounded-2xl p-5 flex flex-col gap-2 border border-white/5">
      <span className="text-xs text-white/50 tracking-wider uppercase">{label}</span>
      <span className="text-2xl font-bold leading-tight" style={{ color: valueColor }}>
        {highlightValue && trendSymbol ? `${trendSymbol} ${value}` : value}
      </span>
      {trendValue && (
        <span className={`text-xs font-medium ${trendColor}`}>
          {!highlightValue && trendSymbol ? `${trendSymbol} ` : ""}{trendValue}
        </span>
      )}
    </div>
  );
}
