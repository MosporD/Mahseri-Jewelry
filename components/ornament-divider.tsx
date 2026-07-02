const gold = "var(--gold)";
const soft = "rgba(185, 151, 79, 0.4)";

export function OrnamentDivider() {
  return (
    <div className="ornament-divider" aria-hidden="true">
      <svg viewBox="0 0 360 26" fill="none">
        <defs>
          <linearGradient id="ornament-fade-l" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="rgba(185, 151, 79, 0)" />
            <stop offset="1" stopColor="rgba(185, 151, 79, 0.55)" />
          </linearGradient>
          <linearGradient id="ornament-fade-r" x1="1" y1="0" x2="0" y2="0">
            <stop offset="0" stopColor="rgba(185, 151, 79, 0)" />
            <stop offset="1" stopColor="rgba(185, 151, 79, 0.55)" />
          </linearGradient>
        </defs>
        <path d="M0 13 H148" stroke="url(#ornament-fade-l)" strokeWidth="1" />
        <path d="M212 13 H360" stroke="url(#ornament-fade-r)" strokeWidth="1" />
        <path d="M180 4 L189 13 L180 22 L171 13 Z" stroke={gold} strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M180 9 L184 13 L180 17 L176 13 Z" stroke={soft} strokeWidth="1" strokeLinejoin="round" />
        <circle cx="158" cy="13" r="1.8" fill={soft} />
        <circle cx="202" cy="13" r="1.8" fill={soft} />
      </svg>
    </div>
  );
}
