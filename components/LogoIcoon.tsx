// Het beeldmerk van Grootgenoot: een grote open cirkel (de oudere) en een
// kleine volle cirkel (de grootgenoot) die tegen elkaar aanleunen, allebei
// met een glimlach. Inline SVG zodat het overal haarscherp is.

export default function LogoIcoon({ className = "h-9 w-auto" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 122 106"
      className={className}
      role="img"
      aria-label="Beeldmerk Grootgenoot"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="50" cy="46" r="38" fill="none" stroke="#185fa5" strokeWidth="15" />
      <path
        d="M30 52 C 38 64, 62 64, 70 52"
        fill="none"
        stroke="#185fa5"
        strokeWidth="8"
        strokeLinecap="round"
      />
      <circle cx="93" cy="79" r="25" fill="#0f6e56" stroke="#ffffff" strokeWidth="5" />
      <path
        d="M82 82 C 87 89, 99 89, 104 82"
        fill="none"
        stroke="#ffffff"
        strokeWidth="5.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
