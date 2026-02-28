/**
 * Sparkline — a lightweight SVG mini-graph.
 *
 * Renders a smooth polyline from the last N data samples.
 * Used inside SpeedCard to visualise network activity trends.
 */

import { useMemo } from 'react';

interface SparklineProps {
  /** Data points (most recent last). */
  data: number[];
  /** Maximum number of visible points. */
  maxPoints?: number;
  /** SVG width. */
  width?: number;
  /** SVG height. */
  height?: number;
  /** Stroke colour (CSS value). */
  color?: string;
}

export function Sparkline({
  data,
  maxPoints = 30,
  width = 200,
  height = 40,
  color = 'var(--color-accent)',
}: SparklineProps) {
  const path = useMemo(() => {
    if (data.length < 2) return '';

    // Use last `maxPoints` samples.
    const visible = data.slice(-maxPoints);

    // Determine y-scale.
    const max = Math.max(...visible, 1); // avoid division by zero
    const stepX = width / (maxPoints - 1);
    const paddingY = 4; // top/bottom padding inside SVG
    const usableHeight = height - paddingY * 2;

    const points = visible.map((val, i) => {
      const x = i * stepX;
      const y = paddingY + usableHeight - (val / max) * usableHeight;
      return `${x},${y}`;
    });

    return `M${points.join(' L')}`;
  }, [data, maxPoints, width, height]);

  if (data.length < 2) {
    return (
      <svg width={width} height={height} aria-hidden="true" style={{ opacity: 0.3 }}>
        <line
          x1={0}
          y1={height / 2}
          x2={width}
          y2={height / 2}
          stroke={color}
          strokeWidth={1.5}
          strokeDasharray="4 4"
          opacity={0.3}
        />
      </svg>
    );
  }

  return (
    <svg width={width} height={height} aria-hidden="true" style={{ display: 'block' }}>
      {/* Gradient fill under the line */}
      <defs>
        <linearGradient id="sparkline-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.15} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>

      {/* Fill area */}
      {path && (
        <path d={`${path} L${width},${height} L0,${height} Z`} fill="url(#sparkline-fill)" />
      )}

      {/* Sparkline */}
      <path
        d={path}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
