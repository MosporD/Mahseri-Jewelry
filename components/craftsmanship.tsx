const gold = "var(--gold)";
const soft = "rgba(185, 151, 79, 0.4)";

function DesignIcon() {
  return (
    <svg viewBox="0 0 80 80" fill="none" aria-hidden="true">
      <circle cx="32" cy="50" r="14" stroke={gold} strokeWidth="2.2" strokeDasharray="3.5 4.5" />
      <circle cx="32" cy="50" r="9" stroke={soft} strokeWidth="1.2" />
      <path d="M62 14 L68 20 L48 40 L40 42 L42 34 Z" stroke={gold} strokeWidth="2.2" strokeLinejoin="round" />
      <path d="M58 18 L64 24" stroke={soft} strokeWidth="1.2" />
    </svg>
  );
}

function CastIcon() {
  return (
    <svg viewBox="0 0 80 80" fill="none" aria-hidden="true">
      <path d="M22 24 L58 24 L52 46 Q40 52 28 46 Z" stroke={gold} strokeWidth="2.2" strokeLinejoin="round" />
      <path d="M22 24 L16 18 M58 24 L64 18" stroke={soft} strokeWidth="1.4" strokeLinecap="round" />
      <path d="M40 52 V58" stroke={gold} strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="40" cy="64" r="2.6" fill={gold} />
    </svg>
  );
}

function SetIcon() {
  return (
    <svg viewBox="0 0 80 80" fill="none" aria-hidden="true">
      <path d="M28 32 L40 20 L52 32 L40 50 Z" stroke={gold} strokeWidth="2.2" strokeLinejoin="round" />
      <path d="M28 32 H52" stroke={soft} strokeWidth="1.2" />
      <path d="M40 20 V50" stroke={soft} strokeWidth="1.2" />
      <path d="M26 42 L22 58 M54 42 L58 58" stroke={gold} strokeWidth="2" strokeLinecap="round" />
      <path d="M22 58 H58" stroke={gold} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function PolishIcon() {
  return (
    <svg viewBox="0 0 80 80" fill="none" aria-hidden="true">
      <circle cx="36" cy="46" r="13" stroke={gold} strokeWidth="2.4" />
      <circle cx="36" cy="46" r="8" stroke={soft} strokeWidth="1.2" />
      <path d="M56 18 V34 M48 26 H64" stroke={gold} strokeWidth="1.8" strokeLinecap="round" />
      <path d="M62 44 V52 M58 48 H66" stroke={soft} strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function HallmarkSeal() {
  return (
    <div className="hallmark-seal-wrap">
      <svg className="hallmark-seal" viewBox="0 0 180 180" fill="none" aria-hidden="true">
        <defs>
          <path
            id="seal-arc"
            d="M90 90 m -62 0 a 62 62 0 1 1 124 0 a 62 62 0 1 1 -124 0"
          />
        </defs>
        <g className="seal-spin">
          <circle cx="90" cy="90" r="86" stroke={soft} strokeWidth="1" strokeDasharray="2 5" />
          <circle cx="90" cy="90" r="74" stroke={soft} strokeWidth="1" />
          <text fill={gold} fontSize="10.5" letterSpacing="3.2" fontFamily="var(--sans)">
            <textPath href="#seal-arc">MAHSERI JEWELLERY · AMMAN · EST. 1989 ·</textPath>
          </text>
        </g>
        <circle cx="90" cy="90" r="44" stroke={gold} strokeWidth="1.4" />
        <text
          x="90"
          y="105"
          textAnchor="middle"
          fill="var(--charcoal)"
          fontSize="44"
          fontFamily="var(--serif)"
        >
          M
        </text>
      </svg>
    </div>
  );
}

const steps: Array<[string, string, string, React.ReactNode]> = [
  [
    "01",
    "Sketch & design",
    "Every commission begins on paper — proportions, stones, and story drawn by hand with you.",
    <DesignIcon key="design" />
  ],
  [
    "02",
    "Cast in pure metal",
    "21K and 18K gold or 925 silver, melted and cast in our own workshop — never outsourced.",
    <CastIcon key="cast" />
  ],
  [
    "03",
    "Set by hand",
    "Each stone is seated and secured under the loupe, prong by prong, by our master setter.",
    <SetIcon key="set" />
  ],
  [
    "04",
    "Polish & hallmark",
    "A mirror finish, a final inspection, and the Mahseri hallmark — your piece is ready.",
    <PolishIcon key="polish" />
  ]
];

export function Craftsmanship() {
  return (
    <>
      <div className="craft-head">
        <div className="section-head">
          <p className="eyebrow">The Mahseri method</p>
          <h2>From first sketch to heirloom</h2>
          <p className="lead">
            Four stages, one pair of hands from start to finish. This is how a Mahseri
            piece has been made since 1989.
          </p>
        </div>
        <HallmarkSeal />
      </div>
      <div className="craft-grid">
        {steps.map(([no, title, text, icon]) => (
          <article className="craft-step" key={no}>
            <div className="craft-icon">{icon}</div>
            <span className="step-no">{no}</span>
            <h3>{title}</h3>
            <p>{text}</p>
          </article>
        ))}
      </div>
    </>
  );
}
