// Lightweight inline SVG icon set used by the "What we offer" cards.
const base = {
  width: 26,
  height: 26,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

export function Icon({ name, className = "" }) {
  const paths = {
    land: (
      <>
        <path d="M3 20h18" />
        <path d="M5 20V9l7-5 7 5v11" />
        <path d="M9 20v-6h6v6" />
      </>
    ),
    discount: (
      <>
        <path d="M9 9h.01M15 15h.01M16 8l-8 8" />
        <rect x="3" y="3" width="18" height="18" rx="3" />
      </>
    ),
    gift: (
      <>
        <rect x="3" y="8" width="18" height="13" rx="1" />
        <path d="M12 8v13M3 12h18M12 8S9 3 6.5 4.5 9 8 12 8zm0 0s3-5 5.5-3.5S15 8 12 8z" />
      </>
    ),
    expert: (
      <>
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21v-1a6 6 0 0 1 12 0v1M18 11l1.5 1.5L23 9" />
      </>
    ),
    legal: (
      <>
        <path d="M12 3v18M5 7h14M7 7l-3 6a3 3 0 0 0 6 0L7 7zm10 0l-3 6a3 3 0 0 0 6 0l-3-6z" />
      </>
    ),
    community: (
      <>
        <circle cx="9" cy="8" r="3" />
        <circle cx="17" cy="9" r="2.2" />
        <path d="M3 20v-1a6 6 0 0 1 12 0v1M15 20v-1a5 5 0 0 1 6-4.9" />
      </>
    ),
  };
  return (
    <svg {...base} className={className}>
      {paths[name] || paths.land}
    </svg>
  );
}
