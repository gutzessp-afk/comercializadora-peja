export default function Logo({ size = 36 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M50 4 L91 27 L91 73 L50 96 L9 73 L9 27 Z"
        fill="var(--peja-azul)"
      />
      <text
        x="50"
        y="50"
        textAnchor="middle"
        dominantBaseline="central"
        fill="white"
        fontSize="34"
        fontWeight="700"
        fontFamily="var(--font-ibm-plex), sans-serif"
      >
        CP
      </text>
    </svg>
  );
}
