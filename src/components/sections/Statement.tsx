"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import SplitType from "split-type";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function Statement() {
  const statementRef = useRef<HTMLDivElement>(null);
  const photonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      if (statementRef.current) {
        const textElement = statementRef.current.querySelector(".statement-text");
        if (textElement) {
          const split = new SplitType(textElement as HTMLElement, { types: "words" });
          if (split.words) {
            // Add gold accent to keyword "light"
            split.words.forEach((word) => {
              if (word.textContent?.toLowerCase() === "light.") {
                word.classList.add("statement-accent-word");
              }
            });

            gsap.to(split.words, {
              scrollTrigger: {
                trigger: statementRef.current,
                start: "top top",
                end: "bottom bottom",
                scrub: 1.2,
              },
              opacity: 1,
              filter: "blur(0px)",
              color: "var(--ink)",
              stagger: 0.1,
              force3D: true,
            });
          }
        }

        // Left vertical gold line
        gsap.to(".statement-line", {
          scrollTrigger: {
            trigger: statementRef.current,
            start: "top top",
            end: "bottom bottom",
            scrub: 1.2,
          },
          scaleY: 1,
        });

        // Right vertical gold line (mirrored)
        gsap.to(".statement-line-right", {
          scrollTrigger: {
            trigger: statementRef.current,
            start: "top top",
            end: "bottom bottom",
            scrub: 1.2,
          },
          scaleY: 1,
        });

        // Credit fade in
        gsap.to(".statement-credit", {
          scrollTrigger: {
            trigger: statementRef.current,
            start: "80% top",
            end: "bottom bottom",
            scrub: true,
          },
          opacity: 1,
        });

        // Floating photon orb that drifts subtly
        if (photonRef.current) {
          gsap.to(photonRef.current, {
            scrollTrigger: {
              trigger: statementRef.current,
              start: "top top",
              end: "bottom bottom",
              scrub: 1.2,
            },
            y: "-30vh",
            x: "15vw",
            scale: 1.5,
            opacity: 0.7,
          });
        }

        // Top decorative dash lines
        gsap.to(".statement-deco-top", {
          scrollTrigger: {
            trigger: statementRef.current,
            start: "top top",
            end: "60% bottom",
            scrub: 1.2,
          },
          scaleX: 1,
          opacity: 1,
        });

        // Bottom decorative dash lines
        gsap.to(".statement-deco-bottom", {
          scrollTrigger: {
            trigger: statementRef.current,
            start: "40% top",
            end: "bottom bottom",
            scrub: 1.2,
          },
          scaleX: 1,
          opacity: 1,
        });
      }
    });

    return () => mm.revert();
  }, []);

  return (
    <section className="statement-wrapper" ref={statementRef} data-nav-theme="light">
      <div className="statement-sticky">
        {/* Vertical gold accent lines */}
        <div className="statement-line"></div>
        <div className="statement-line-right"></div>

        {/* Decorative horizontal dashes */}
        <div className="statement-deco-top"></div>
        <div className="statement-deco-bottom"></div>

        {/* Floating photon orb */}
        <div className="statement-photon" ref={photonRef}>
          <div className="statement-photon-core"></div>
          <div className="statement-photon-ring"></div>
        </div>

        <h2 className="statement-text cormorant-italic">
          Every space holds a hidden language — we make it speak in light.
        </h2>
        <div className="statement-credit">— Sophie Leclercq, Founder</div>
      </div>
    </section>
  );
}
