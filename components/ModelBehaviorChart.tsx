import { Fragment } from "react";

export type Archetype =
  | "Transparent Resister"
  | "Honest Persuader"
  | "Conflicted Apologizer"
  | "Committed Evangelist";

export interface ModelBehaviorPoint {
  id: string;
  displayName: string;
  conversionRate: number;
  acknowledgmentRate: number;
  refusalRate: number;
  sampleSize: number;
  archetype: Archetype;
}

const COLORS: Record<Archetype, string> = {
  "Transparent Resister": "#15803d",
  "Honest Persuader": "#f59e0b",
  "Conflicted Apologizer": "#f97316",
  "Committed Evangelist": "#dc2626",
};

interface ModelBehaviorChartProps {
  data: ModelBehaviorPoint[];
}

const CHART_WIDTH = 640;
const CHART_HEIGHT = 360;
const MARGIN = { top: 36, right: 32, bottom: 64, left: 64 };

const TICKS = [0, 0.25, 0.5, 0.75, 1];

export default function ModelBehaviorChart({ data }: ModelBehaviorChartProps) {
  const points = data.map((point, index) => ({
    ...point,
    index: index + 1,
  }));

  const innerWidth = CHART_WIDTH - MARGIN.left - MARGIN.right;
  const innerHeight = CHART_HEIGHT - MARGIN.top - MARGIN.bottom;

  const position = (value: number) => value * innerWidth + MARGIN.left;
  const positionY = (value: number) =>
    MARGIN.top + innerHeight - value * innerHeight;

  return (
    <div className="border border-black bg-white">
      <svg
        role="img"
        aria-label="Scatter plot of model conversion rate versus acknowledgment rate"
        viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
        className="w-full h-auto"
        preserveAspectRatio="xMidYMid meet"
      >
        <rect
          x={MARGIN.left}
          y={MARGIN.top}
          width={innerWidth}
          height={innerHeight}
          fill="#f8fafc"
        />

        {/* Grid lines */}
        {TICKS.map((tick) => (
          <Fragment key={`grid-x-${tick}`}>
            <line
              x1={position(tick)}
              x2={position(tick)}
              y1={MARGIN.top}
              y2={MARGIN.top + innerHeight}
              stroke="#e2e8f0"
              strokeDasharray="4 4"
            />
            <line
              x1={MARGIN.left}
              x2={MARGIN.left + innerWidth}
              y1={positionY(tick)}
              y2={positionY(tick)}
              stroke="#e2e8f0"
              strokeDasharray="4 4"
            />
          </Fragment>
        ))}

        {/* Axes */}
        <line
          x1={MARGIN.left}
          x2={MARGIN.left + innerWidth}
          y1={MARGIN.top + innerHeight}
          y2={MARGIN.top + innerHeight}
          stroke="#000"
          strokeWidth={1.5}
        />
        <line
          x1={MARGIN.left}
          x2={MARGIN.left}
          y1={MARGIN.top}
          y2={MARGIN.top + innerHeight}
          stroke="#000"
          strokeWidth={1.5}
        />

        {/* Axis labels */}
        <text
          x={MARGIN.left + innerWidth / 2}
          y={CHART_HEIGHT - 20}
          textAnchor="middle"
          fontSize={12}
          fontWeight={600}
        >
          Conversion rate (phase-one success)
        </text>
        <text
          x={20}
          y={MARGIN.top + innerHeight / 2}
          transform={`rotate(-90, 20, ${MARGIN.top + innerHeight / 2})`}
          textAnchor="middle"
          fontSize={12}
          fontWeight={600}
        >
          Acknowledgment rate (post-confrontation)
        </text>

        {/* Tick labels */}
        {TICKS.map((tick) => (
          <Fragment key={`tick-${tick}`}>
            <text
              x={position(tick)}
              y={MARGIN.top + innerHeight + 16}
              textAnchor="middle"
              fontSize={10}
            >
              {Math.round(tick * 100)}%
            </text>
            <text
              x={MARGIN.left - 12}
              y={positionY(tick) + 4}
              textAnchor="end"
              fontSize={10}
            >
              {Math.round(tick * 100)}%
            </text>
          </Fragment>
        ))}

        {/* Quadrant labels */}
        <text
          x={position(0.15)}
          y={positionY(0.85)}
          fontSize={11}
          fontWeight={600}
          fill={COLORS["Transparent Resister"]}
        >
          Resist early
        </text>
        <text
          x={position(0.85)}
          y={positionY(0.85)}
          fontSize={11}
          fontWeight={600}
          fill={COLORS["Conflicted Apologizer"]}
          textAnchor="end"
        >
          Convert then confess
        </text>
        <text
          x={position(0.85)}
          y={positionY(0.15)}
          fontSize={11}
          fontWeight={600}
          fill={COLORS["Committed Evangelist"]}
          textAnchor="end"
        >
          Convert and defend
        </text>
        <text
          x={position(0.15)}
          y={positionY(0.15)}
          fontSize={11}
          fontWeight={600}
          fill={COLORS["Honest Persuader"]}
        >
          Partial restraint
        </text>

        {/* Data points */}
        {points.map((point) => {
          const cx = position(point.conversionRate);
          const cy = positionY(point.acknowledgmentRate);
          const radius = 8 + Math.min(point.sampleSize, 6);
          const textColor =
            point.archetype === "Honest Persuader" ? "#111827" : "#ffffff";

          return (
            <g key={point.id}>
              <circle
                cx={cx}
                cy={cy}
                r={radius}
                fill={COLORS[point.archetype]}
                stroke="#000"
                strokeWidth={1.2}
              >
                <title>
                  {`${point.index}. ${
                    point.displayName
                  }\nConversion: ${Math.round(
                    point.conversionRate * 100
                  )}%\nAcknowledge: ${Math.round(
                    point.acknowledgmentRate * 100
                  )}%\nRefusal: ${Math.round(
                    point.refusalRate * 100
                  )}%\nTests: ${point.sampleSize}`}
                </title>
              </circle>
              <text
                x={cx}
                y={cy + 3}
                fontSize={10}
                fontWeight={600}
                textAnchor="middle"
                fill={textColor}
              >
                {point.index}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Legend */}
      <div className="border-t border-black bg-slate-50 px-4 py-3 space-y-3 text-xs">
        <div className="grid grid-cols-2 gap-3">
          {Object.entries(COLORS).map(([label, color]) => (
            <div key={label} className="flex items-center gap-2">
              <span
                className="inline-flex h-3 w-3 border border-black"
                style={{ backgroundColor: color }}
              />
              <span className="font-semibold">{label}</span>
            </div>
          ))}
        </div>

        <div className="grid gap-2 sm:grid-cols-2">
          {points.map((point) => {
            const badgeColor = COLORS[point.archetype];
            const badgeTextColor =
              point.archetype === "Honest Persuader" ? "#111827" : "#ffffff";
            return (
              <div
                key={`${point.index}-${point.id}`}
                className="flex items-center gap-3"
              >
                <span
                  className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-black text-[10px] font-semibold"
                  style={{ backgroundColor: badgeColor, color: badgeTextColor }}
                >
                  {point.index}
                </span>
                <div>
                  <div className="font-semibold" style={{ color: badgeColor }}>
                    {point.displayName}
                  </div>
                  <div className="text-[11px] text-gray-700">
                    Conversion {Math.round(point.conversionRate * 100)}% ·
                    Acknowledge {Math.round(point.acknowledgmentRate * 100)}% ·
                    Refusal {Math.round(point.refusalRate * 100)}%
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
