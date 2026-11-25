import { useState } from 'react';
import { SalesPoint } from '../types/kol';

interface SalesTrendChartProps {
  data: SalesPoint[];
  periodLabel: string;
}

export function SalesTrendChart({ data, periodLabel }: SalesTrendChartProps) {
  const [activeIndex, setActiveIndex] = useState<number>(Math.max(0, data.length - 1));

  if (data.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center text-sm text-slate-500">
        Data tren penjualan belum tersedia.
      </div>
    );
  }

  const safeIndex = Math.min(activeIndex, data.length - 1);
  const selectedPoint = data[safeIndex];

  const width = 620;
  const height = 210;
  const padLeft = 48;
  const padRight = 18;
  const padTop = 20;
  const padBottom = 32;

  const allValues = data.flatMap((d) => [d.actualUnits, d.targetUnits]);
  const rawMin = Math.min(...allValues);
  const rawMax = Math.max(...allValues);
  const padding = Math.max(200, (rawMax - rawMin) * 0.25);
  const minVal = Math.max(0, rawMin - padding);
  const maxVal = rawMax + padding;
  const range = Math.max(1, maxVal - minVal);

  const plotW = width - padLeft - padRight;
  const plotH = height - padTop - padBottom;

  const getX = (idx: number) =>
    data.length === 1 ? padLeft + plotW / 2 : padLeft + (idx / (data.length - 1)) * plotW;

  const getY = (val: number) => padTop + plotH - ((val - minVal) / range) * plotH;

  const actualCoords = data.map((d, i) => ({ x: getX(i), y: getY(d.actualUnits) }));
  const targetCoords = data.map((d, i) => ({ x: getX(i), y: getY(d.targetUnits) }));

  const actualPath = actualCoords
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
    .join(' ');

  const targetPath = targetCoords
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
    .join(' ');

  const areaPath = `${actualPath} L ${actualCoords[actualCoords.length - 1].x.toFixed(1)} ${(
    padTop + plotH
  ).toFixed(1)} L ${actualCoords[0].x.toFixed(1)} ${(padTop + plotH).toFixed(1)} Z`;

  const gridTicks = [0, 0.5, 1].map((ratio) => {
    const val = minVal + ratio * range;
    const y = getY(val);
    const formatted =
      val >= 1000 ? `${(val / 1000).toFixed(val >= 10000 ? 0 : 1)}K` : Math.round(val).toString();
    return { val, y, formatted };
  });

  const deltaUnits = selectedPoint.actualUnits - selectedPoint.targetUnits;
  const deltaPositive = deltaUnits >= 0;

  return (
    <div className="space-y-3">
      {/* Interactive Selected Point Summary Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-[#F0F9FF] border border-[#BAE6FD]/70 px-3.5 py-2.5">
        <div className="flex items-center gap-2 text-xs text-slate-600">
          <span className="font-semibold text-[#0B1F3A]">
            {periodLabel} {selectedPoint.label}
          </span>
          {selectedPoint.note && (
            <>
              <span aria-hidden="true">·</span>
              <span className="text-[#0369A1] font-medium">{selectedPoint.note}</span>
            </>
          )}
        </div>
        <div className="flex items-center gap-3 text-xs tabular-nums">
          <span className="text-slate-600">
            Aktual:{' '}
            <strong className="text-[#0B1F3A] font-semibold">
              {selectedPoint.actualUnits.toLocaleString('id-ID')} unit
            </strong>
          </span>
          <span aria-hidden="true" className="text-slate-300">
            |
          </span>
          <span className="text-slate-600">
            Target:{' '}
            <strong className="text-slate-800 font-medium">
              {selectedPoint.targetUnits.toLocaleString('id-ID')}
            </strong>
          </span>
          <span
            className={`font-semibold ${
              deltaPositive ? 'text-emerald-700' : 'text-rose-700'
            }`}
          >
            {deltaPositive ? '+' : ''}
            {deltaUnits.toLocaleString('id-ID')}
          </span>
        </div>
      </div>

      {/* Responsive SVG Chart */}
      <div className="w-full overflow-hidden">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto select-none"
          role="img"
          aria-label="Grafik tren penjualan aktual dibanding target"
        >
          <defs>
            <linearGradient id="wardahSalesArea" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.28" />
              <stop offset="100%" stopColor="#E0F2FE" stopOpacity="0.02" />
            </linearGradient>
          </defs>

          {/* Horizontal Grid Lines */}
          {gridTicks.map((tick, idx) => (
            <g key={idx}>
              <line
                x1={padLeft}
                y1={tick.y}
                x2={width - padRight}
                y2={tick.y}
                stroke="#E2E8F0"
                strokeWidth="1"
              />
              <text
                x={padLeft - 8}
                y={tick.y + 4}
                textAnchor="end"
                className="fill-slate-400 text-[10px] font-mono"
              >
                {tick.formatted}
              </text>
            </g>
          ))}

          {/* Area Fill */}
          <path d={areaPath} fill="url(#wardahSalesArea)" />

          {/* Target Dashed Line */}
          <path
            d={targetPath}
            fill="none"
            stroke="#0284C7"
            strokeWidth="1.75"
            strokeDasharray="5 4"
            strokeLinecap="round"
          />

          {/* Actual Solid Line */}
          <path
            d={actualPath}
            fill="none"
            stroke="#0B1F3A"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Active vertical guide */}
          <line
            x1={actualCoords[safeIndex].x}
            y1={padTop}
            x2={actualCoords[safeIndex].x}
            y2={padTop + plotH}
            stroke="#94A3B8"
            strokeWidth="1"
            strokeDasharray="2 3"
          />

          {/* Interactive Data Points */}
          {data.map((d, i) => {
            const p = actualCoords[i];
            const isActive = i === safeIndex;
            const isBelowTarget = d.actualUnits < d.targetUnits;
            return (
              <g
                key={d.label}
                className="cursor-pointer"
                onClick={() => setActiveIndex(i)}
                onMouseEnter={() => setActiveIndex(i)}
              >
                {/* Invisible wider hit target */}
                <circle cx={p.x} cy={p.y} r="18" fill="transparent" />
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={isActive ? 5.5 : 3.5}
                  fill={isBelowTarget ? '#E11D48' : '#0B1F3A'}
                  stroke="#FFFFFF"
                  strokeWidth="2"
                />
                <text
                  x={p.x}
                  y={height - 10}
                  textAnchor="middle"
                  className={`text-[11px] font-medium ${
                    isActive ? 'fill-[#0B1F3A] font-semibold' : 'fill-slate-500'
                  }`}
                >
                  {d.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Chart Legend */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 pt-1">
        <div className="flex items-center gap-4">
          <span className="inline-flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-[#0B1F3A] inline-block rounded-full" />
            Penjualan Aktual
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-3 h-0.5 border-t-2 border-dashed border-[#0284C7] inline-block" />
            Target Penjualan
          </span>
        </div>
        <span className="text-[11px] text-slate-400">Ketuk titik grafik untuk detail periode</span>
      </div>
    </div>
  );
}
