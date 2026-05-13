"use client";

import { 사업부문_COLORS } from "@/lib/format";

type Props = {
  channels: string[];
  selected: string;
  onChange: (ch: string) => void;
};

export default function ChannelFilter({ channels, selected, onChange }: Props) {
  return (
    <div className="flex gap-2 flex-wrap justify-end">
      <button
        onClick={() => onChange("전체")}
        className="px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200"
        style={
          selected === "전체"
            ? {
                background: "linear-gradient(90deg, #00CFAA, #7B70EE)",
                color: "#fff",
                boxShadow: "0 0 14px rgba(0,207,170,0.45)",
              }
            : {
                color: "rgba(255,255,255,0.5)",
                border: "1px solid rgba(255,255,255,0.1)",
              }
        }
      >
        전체
      </button>

      {channels.map((ch) => {
        const isActive = selected === ch;
        const color = 사업부문_COLORS[ch] ?? "#4A9EFF";
        return (
          <button
            key={ch}
            onClick={() => onChange(ch)}
            className="px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200"
            style={
              isActive
                ? {
                    background: color,
                    color: "#13141F",
                    boxShadow: `0 0 14px ${color}70`,
                  }
                : {
                    color: "rgba(255,255,255,0.5)",
                    border: "1px solid rgba(255,255,255,0.1)",
                  }
            }
          >
            {ch}
          </button>
        );
      })}
    </div>
  );
}
