"use client";

import { useRouter } from "next/navigation";

// Gaat terug naar de pagina waar de bezoeker echt vandaan kwam (browserhistorie).
// Kwam iemand rechtstreeks binnen (geen historie), dan valt 'ie terug op `naar`.
export default function TerugKnop({
  naar = "/",
  label = "Terug",
  className = "mb-8 inline-flex items-center gap-2 text-lg font-semibold text-support",
}: {
  naar?: string;
  label?: string;
  className?: string;
}) {
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={() => {
        if (typeof window !== "undefined" && window.history.length > 1) {
          router.back();
        } else {
          router.push(naar);
        }
      }}
      className={className}
    >
      <span aria-hidden="true">←</span> {label}
    </button>
  );
}
