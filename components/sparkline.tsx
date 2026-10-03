"use client";

export function Sparkline({ values, positive = true, large = false }: { values: number[]; positive?: boolean; large?: boolean }) {
  const width = large ? 420 : 110;
  const height = large ? 70 : 30;
  if (!values.length) return <svg className="sparkline" style={{ width, height }} viewBox={`0 0 ${width} ${height}`} />;
  if (values.length === 1) {
    const y = height / 2;
    const points = `${width / 4},${y} ${(width * 3) / 4},${y}`;
    return <svg className="sparkline" style={{ width, height, ...(large ? { width: "100%", height: "100%" } : {}) }} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" role="img" aria-label="Price trend sparkline"><polyline points={points} fill="none" stroke={positive ? "#a9dc28" : "#e7806d"} strokeWidth={large ? 2.4 : 1.8} strokeLinecap="round" strokeLinejoin="round" /></svg>;
  }
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const points = values.map((value, index) => `${(index / (values.length - 1)) * width},${height - ((value - min) / range) * (height - 6) - 3}`).join(" ");
  const areaPoints = `0,${height} ${points} ${width},${height}`;
  return (
    <svg className="sparkline" style={{ width, height, ...(large ? { width: "100%", height: "100%" } : {}) }} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" role="img" aria-label="Price trend sparkline">
      {large && <polygon points={areaPoints} fill={positive ? "rgba(198,241,53,.10)" : "rgba(239,131,111,.10)"} />}
      <polyline points={points} fill="none" stroke={positive ? "#a9dc28" : "#e7806d"} strokeWidth={large ? 2.4 : 1.8} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
