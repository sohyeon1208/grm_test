type Props = {
  label: string;
  value: string;
  trend?: "positive" | "negative" | "neutral";
  trendValue?: string;
};

export default function KpiCard({ label, value, trend, trendValue }: Props) {
  const trendColor =
    trend === "positive"
      ? "text-emerald-400"
      : trend === "negative"
      ? "text-pink-400"
      : "text-white/50";

  const trendSymbol =
    trend === "positive" ? "▲" : trend === "negative" ? "▼" : "";

  return (
    <div className="bg-[#1C1E2E] rounded-2xl p-5 flex flex-col gap-2 border border-white/5">
      <span className="text-xs text-white/50 tracking-wider uppercase">{label}</span>
      <span className="text-2xl font-bold leading-tight" style={{ color: "rgba(255,255,255,0.87)" }}>
        {value}
      </span>
      {trendValue && (
        <span className={`text-xs font-medium ${trendColor}`}>
          {trendSymbol} {trendValue}
        </span>
      )}
    </div>
  );
}
