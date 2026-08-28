"use client";

import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";

export function MiniTrendChart({
  title,
  data,
  format,
}: {
  title: string;
  data: { year: number; value: number }[];
  format: (v: number) => string;
}) {
  const latest = data[data.length - 1];
  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between">
        <span className="text-2xs uppercase tracking-[0.06em] text-ink-faint">
          {title}
        </span>
        <span className="font-mono text-xs tabular text-ink">
          {format(latest.value)}
        </span>
      </div>
      <div className="h-20">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
            <XAxis
              dataKey="year"
              tick={{ fontSize: 9, fill: "#93968F" }}
              axisLine={false}
              tickLine={false}
              interval={0}
            />
            <Tooltip
              cursor={{ fill: "#F2F1EC" }}
              formatter={(v: number) => format(v)}
              labelFormatter={(l) => `FY${l}`}
              contentStyle={{
                fontSize: 11,
                borderRadius: 4,
                border: "1px solid #E4E2DA",
              }}
            />
            <Bar dataKey="value" fill="#0E5E45" radius={[2, 2, 0, 0]} maxBarSize={22} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
