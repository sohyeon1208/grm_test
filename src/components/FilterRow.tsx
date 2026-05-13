"use client";

import { useSearchParams, useRouter } from "next/navigation";
import type { FilterOption } from "@/lib/process";

type Props = {
  label: string;
  paramKey: string;
  options: FilterOption[];
  formatLabel?: (value: string) => string; // 버튼 텍스트 변환 (예: "4" → "4월")
};

// 전체 버튼: purple → cyan 그라디언트 (모든 필터 행 공통)
const ALL_GRADIENT = "linear-gradient(90deg, #7B70EE, #00CFAA)";
const ALL_GLOW = "0 0 14px rgba(123,112,238,0.5)";

export default function FilterRow({ label, paramKey, options, formatLabel }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const current = searchParams.get(paramKey) ?? "전체";

  const select = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (value === "전체") {
      params.delete(paramKey);
    } else {
      params.set(paramKey, value);
    }

    // 상위 필터 변경 시 하위 필터 초기화
    if (paramKey === "year") {
      params.delete("month");           // 연도 바뀌면 월 초기화
    }
    if (paramKey === "division") {
      params.delete("service");
      params.delete("customer");
    }
    if (paramKey === "service") {
      params.delete("customer");
    }

    router.push(`?${params.toString()}`, { scroll: false });
  };

  if (options.length === 0) return null;

  return (
    <div className="flex items-start gap-3">
      <span
        className="text-xs font-medium mt-1.5 min-w-[4rem] text-right flex-shrink-0"
        style={{ color: "rgba(255,255,255,0.55)" }}
      >
        {label}
      </span>

      <div className="flex gap-2 flex-wrap">
        {/* 전체 버튼 */}
        <button
          onClick={() => select("전체")}
          className="px-3.5 py-1 rounded-full text-xs font-semibold transition-all duration-200"
          style={
            current === "전체"
              ? { background: ALL_GRADIENT, color: "#fff", boxShadow: ALL_GLOW }
              : { color: "rgba(255,255,255,0.45)", border: "1px solid rgba(255,255,255,0.1)" }
          }
        >
          전체
        </button>

        {/* 개별 옵션 버튼 */}
        {options.map((opt) => {
          const isActive = current === opt.value;
          return (
            <button
              key={opt.value}
              onClick={() => select(opt.value)}
              className="px-3.5 py-1 rounded-full text-xs font-semibold transition-all duration-200"
              style={
                isActive
                  ? {
                      background: opt.color,
                      color: isLightColor(opt.color) ? "#13141F" : "#fff",
                      boxShadow: `0 0 12px ${opt.color}70`,
                    }
                  : {
                      color: "rgba(255,255,255,0.45)",
                      border: "1px solid rgba(255,255,255,0.1)",
                    }
              }
            >
              {formatLabel ? formatLabel(opt.value) : opt.value}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// 밝은 색상이면 텍스트를 어둡게
function isLightColor(hex: string): boolean {
  const c = hex.replace("#", "");
  const r = parseInt(c.slice(0, 2), 16);
  const g = parseInt(c.slice(2, 4), 16);
  const b = parseInt(c.slice(4, 6), 16);
  return r * 0.299 + g * 0.587 + b * 0.114 > 160;
}
