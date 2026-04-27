"use client";

import { useMemo } from "react";

export default function Marquee() {
  // FIXED: Memoize text to prevent re-renders
  const marqueeText = useMemo(() => {
    const text = "RESIDENTIAL · COMMERCIAL · LIGHTING · CURATION · WARSAW · VIENNA · PARIS · ";
    const half = text.repeat(4); // Repeat 4 times to ensure it covers wide screens
    return `${half}${half}`;
  }, []);

  return (
    <section className="marquee-section" data-nav-theme="dark">
      <div className="marquee-content">
        {marqueeText}
      </div>
    </section>
  );
}
