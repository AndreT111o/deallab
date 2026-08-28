const ROW = [
  { t: "RACE", d: "+1.2%", up: true },
  { t: "MC.PA", d: "-0.4%", up: false },
  { t: "RMS.PA", d: "+0.8%", up: true },
  { t: "MONC.MI", d: "+0.3%", up: true },
  { t: "P911.DE", d: "-0.9%", up: false },
  { t: "KER.PA", d: "-1.6%", up: false },
  { t: "SPOT", d: "+2.1%", up: true },
  { t: "RYAAY", d: "+0.1%", up: true },
];

/** Illustrative only — not live market data. */
export function TickerStrip() {
  const doubled = [...ROW, ...ROW];
  return (
    <div className="overflow-hidden border-b border-line bg-ink">
      <div className="flex w-max animate-[marquee_38s_linear_infinite] gap-8 py-1.5 motion-reduce:animate-none">
        {doubled.map((item, i) => (
          <span
            key={i}
            className="flex items-center gap-1.5 whitespace-nowrap font-mono text-2xs text-paper/70"
          >
            <span className="text-paper/90">{item.t}</span>
            <span className={item.up ? "text-emerald-400" : "text-red-400"}>
              {item.d}
            </span>
          </span>
        ))}
      </div>
      <style>{`
        @keyframes marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}
