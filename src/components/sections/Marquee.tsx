"use client";

export default function Marquee() {
  const text = "RESIDENTIAL · COMMERCIAL · LIGHTING · CURATION · WARSAW · VIENNA · PARIS · ";
  const half = text.repeat(4); // Repeat 4 times to ensure it covers wide screens

  return (
    <section className="marquee-section" data-nav-theme="dark">
      <div className="marquee-content">
        {half}{half}
      </div>
    </section>
  );
}
