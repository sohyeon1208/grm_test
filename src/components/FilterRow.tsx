"use client";

import { useSearchParams, useRouter } from "next/navigation";
import type { FilterOption } from "@/lib/process";
import type { ThemeTokens } from "@/lib/theme";
import { DARK } from "@/lib/theme";

type Props = {
  label: string;
  paramKey: string;
  options: FilterOption[];
  formatLabel?: (value: string) => string;
  theme?: ThemeTokens;
};


export default function FilterRow({ label, paramKey, options, formatLabel, theme = DARK }: Props) {
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

  const f = theme.filter;

  return (
    <div className="flex items-start gap-3">
      <span
        className="text-xs font-medium mt-1.5 min-w-[4rem] text-right flex-shrink-0"
        style={{ color: f.labelColor }}
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
              ? { background: f.allActiveGrad, color: "#fff", boxShadow: f.allActiveGlow }
              : { color: f.btnInactive, border: `1px solid ${f.btnBorder}` }
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
                  ? { background: opt.color, color: f.optActiveText(isLightColor(opt.color)), boxShadow: f.optActiveGlow(opt.color) }
                  : { color: f.btnInactive, border: `1px solid ${f.btnBorder}` }
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
