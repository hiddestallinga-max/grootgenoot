"use client";

import Link from "next/link";
import { useCallback, useRef } from "react";

// Glazen kaart/knop die je muis volgt: kantelt licht mee (3D), schuift een
// paar pixels richting de cursor en toont een lichtglans op de muispositie.
// De visuele stijl zit in de .glas-klasse in globals.css; dit component
// stuurt alleen de CSS-variabelen aan. Respecteert prefers-reduced-motion
// (dan staat de transform in CSS uit) en doet niets bij touch.

type Props = {
  href?: string;
  className?: string;
  children: React.ReactNode;
  /** Hoeveel px de kaart maximaal richting je muis schuift. */
  volgKracht?: number;
  /** Maximale kanteling in graden. */
  kantelKracht?: number;
};

export default function GlasKaart({
  href,
  className = "",
  children,
  volgKracht = 10,
  kantelKracht = 5,
}: Props) {
  const ref = useRef<HTMLDivElement | null>(null);

  const beweeg = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const el = ref.current;
      if (!el || e.pointerType !== "mouse") return;
      const r = el.getBoundingClientRect();
      const x = e.clientX - r.left;
      const y = e.clientY - r.top;
      const dx = x / r.width - 0.5;
      const dy = y / r.height - 0.5;
      el.style.setProperty("--mx", `${x.toFixed(0)}px`);
      el.style.setProperty("--my", `${y.toFixed(0)}px`);
      el.style.setProperty("--tx", `${(dx * volgKracht).toFixed(1)}px`);
      el.style.setProperty("--ty", `${(dy * volgKracht).toFixed(1)}px`);
      el.style.setProperty("--rx", `${(-dy * kantelKracht).toFixed(2)}deg`);
      el.style.setProperty("--ry", `${(dx * kantelKracht).toFixed(2)}deg`);
    },
    [volgKracht, kantelKracht],
  );

  const reset = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty("--tx", "0px");
    el.style.setProperty("--ty", "0px");
    el.style.setProperty("--rx", "0deg");
    el.style.setProperty("--ry", "0deg");
  }, []);

  const kaart = (
    <div
      ref={ref}
      onPointerMove={beweeg}
      onPointerLeave={reset}
      className={`glas ${className}`}
    >
      {children}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="group block focus:outline-none">
        {kaart}
      </Link>
    );
  }
  return kaart;
}
