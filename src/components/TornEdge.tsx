type TornEdgeProps = {
  fill: string;
  className?: string;
};

/**
 * A hand-torn paper edge used as a section divider, instead of a flat line.
 * Points are irregular on purpose — deliberately not a smooth/symmetrical
 * wave, so it reads as torn rather than templated.
 */
export default function TornEdge({ fill, className = "" }: TornEdgeProps) {
  return (
    <svg
      aria-hidden="true"
      preserveAspectRatio="none"
      viewBox="0 0 1440 60"
      className={className}
    >
      <path
        d="M0,24 L52,36 L101,13 L149,41 L206,19 L251,45 L303,15 L358,39 L412,11 L459,37 L517,21 L566,44 L609,14 L667,40 L718,17 L774,46 L826,12 L871,38 L928,22 L981,43 L1029,15 L1084,39 L1136,18 L1189,45 L1241,13 L1288,37 L1341,20 L1392,42 L1440,19 L1440,60 L0,60 Z"
        fill={fill}
      />
    </svg>
  );
}
