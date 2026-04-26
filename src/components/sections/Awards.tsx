"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const awards = [
  {
    title: "Dezeen Awards",
    category: "Lighting Design of the Year",
    year: "2024",
  },
  {
    title: "Red Dot",
    category: "Best of the Best — Interior",
    year: "2024",
  },
  {
    title: "Wallpaper* Design Awards",
    category: "Best Domestic Design",
    year: "2023",
  },
  {
    title: "iF Design Award",
    category: "Gold — Architecture",
    year: "2023",
  },
  {
    title: "Frame Awards",
    category: "Spatial Designer of the Year",
    year: "2024",
  },
  {
    title: "Architectural Digest",
    category: "AD100 — Rising Studio",
    year: "2023",
  },
];

export default function Awards() {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const lineRefs = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      // Heading reveal
      gsap.from(headingRef.current, {
        yPercent: 100,
        opacity: 0,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: headingRef.current,
          start: "top 85%",
        },
      });

      // Each row staggers in
      lineRefs.current.forEach((line, i) => {
        const elements = line.querySelectorAll(".award-cell");
        const divider = line.querySelector(".award-divider-line");

        gsap.from(divider, {
          scaleX: 0,
          transformOrigin: "left center",
          duration: 1,
          ease: "power3.inOut",
          scrollTrigger: {
            trigger: line,
            start: "top 85%",
          },
        });

        gsap.from(elements, {
          y: 40,
          opacity: 0,
          duration: 0.8,
          stagger: 0.1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: line,
            start: "top 85%",
          },
          delay: 0.2,
        });
      });

      // Counter animation for the stat
      gsap.from(".awards-count", {
        textContent: 0,
        duration: 2,
        ease: "power2.out",
        snap: { textContent: 1 },
        scrollTrigger: {
          trigger: ".awards-count",
          start: "top 85%",
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="awards"
      ref={sectionRef}
      data-nav-theme="dark"
      style={{
        padding: "15vh 8vw",
        backgroundColor: "#0a0a0a",
        color: "#f5f0e8",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Ambient glow */}
      <div
        style={{
          position: "absolute",
          top: "-20%",
          right: "-10%",
          width: "50vw",
          height: "50vw",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(200,160,80,0.06) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      {/* Header row */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          marginBottom: "8vh",
        }}
      >
        <div ref={headingRef}>
          <p
            style={{
              fontSize: "0.7rem",
              letterSpacing: "0.3em",
              textTransform: "uppercase",
              opacity: 0.4,
              marginBottom: "1.5rem",
            }}
          >
            Recognition & Awards
          </p>
          <h2
            className="cormorant-italic"
            style={{
              fontSize: "clamp(2.5rem, 5vw, 4.5rem)",
              fontWeight: 400,
              lineHeight: 1.1,
            }}
          >
            Awarded
            <br />
            excellence
          </h2>
        </div>

        <div style={{ textAlign: "right" }}>
          <span
            className="awards-count"
            style={{
              fontSize: "clamp(4rem, 8vw, 7rem)",
              fontWeight: 200,
              lineHeight: 1,
              display: "block",
              fontFamily: "var(--font-cormorant)",
            }}
          >
            47
          </span>
          <span
            style={{
              fontSize: "0.7rem",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              opacity: 0.4,
            }}
          >
            Awards worldwide
          </span>
        </div>
      </div>

      {/* Award rows */}
      <div>
        {awards.map((award, i) => (
          <div
            key={i}
            ref={(el) => {
              if (el) lineRefs.current[i] = el;
            }}
            onMouseEnter={(e) => {
              gsap.to(e.currentTarget, {
                backgroundColor: "rgba(255,255,255,0.03)",
                x: 8,
                duration: 0.4,
                ease: "power2.out",
              });
              gsap.to(
                e.currentTarget.querySelector(".award-year"),
                {
                  color: "#c8a050",
                  duration: 0.3,
                }
              );
            }}
            onMouseLeave={(e) => {
              gsap.to(e.currentTarget, {
                backgroundColor: "transparent",
                x: 0,
                duration: 0.4,
                ease: "power2.out",
              });
              gsap.to(
                e.currentTarget.querySelector(".award-year"),
                {
                  color: "rgba(245,240,232,0.3)",
                  duration: 0.3,
                }
              );
            }}
            style={{
              position: "relative",
              cursor: "default",
              padding: "2rem 0",
              borderRadius: "4px",
              transition: "none",
            }}
          >
            {/* Top divider */}
            <div
              className="award-divider-line"
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: "1px",
                backgroundColor: "rgba(255,255,255,0.08)",
              }}
            />

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1.5fr auto",
                alignItems: "center",
                gap: "2rem",
                padding: "0 1rem",
              }}
            >
              <span
                className="award-cell"
                style={{
                  fontFamily: "var(--font-cormorant)",
                  fontStyle: "italic",
                  fontSize: "clamp(1.2rem, 2vw, 1.6rem)",
                  fontWeight: 400,
                }}
              >
                {award.title}
              </span>

              <span
                className="award-cell"
                style={{
                  fontSize: "0.8rem",
                  letterSpacing: "0.05em",
                  opacity: 0.5,
                }}
              >
                {award.category}
              </span>

              <span
                className="award-cell award-year"
                style={{
                  fontSize: "0.75rem",
                  letterSpacing: "0.2em",
                  color: "rgba(245,240,232,0.3)",
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {award.year}
              </span>
            </div>

            {/* Bottom divider for last item */}
            {i === awards.length - 1 && (
              <div
                className="award-divider-line"
                style={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: "1px",
                  backgroundColor: "rgba(255,255,255,0.08)",
                }}
              />
            )}
          </div>
        ))}
      </div>
    </section>
  );
}