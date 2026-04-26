"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import dynamic from "next/dynamic";
import SplitType from "split-type";

const ThreeScene = dynamic(() => import("@/components/ThreeScene"), { ssr: false });

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function Hero() {
  const heroTransitionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      // Hero Text Reveal
      const heroTitleSplit = new SplitType(".hero-title", { types: "chars" });
      const heroTimeline = gsap.timeline({ delay: 1.5 }); // after loader

      if (heroTitleSplit.chars) {
        heroTimeline.to(heroTitleSplit.chars, {
          y: "0%",
          duration: 1.2,
          stagger: 0.05,
          ease: "power3.out"
        });

        // Hero Text Blur & Fade on Scroll
        gsap.to(heroTitleSplit.chars, {
          scrollTrigger: {
            trigger: ".hero-wrapper",
            start: "top top",
            end: "45% top", // Znika w połowie sekcji Hero, oddając scenę żarówkom
            scrub: 1.5,
          },
          opacity: 0,
          filter: "blur(16px)",
          stagger: 0.02,
        });
      }

      // Scroll Indicator Fade Out
      gsap.to(".hero-scroll-indicator", {
        scrollTrigger: {
          trigger: ".hero-wrapper",
          start: "top top",
          end: "15% top", // Znika od razu po rozpoczęciu scrolla
          scrub: true,
        },
        opacity: 0,
      });

      // Hero Scroll Transition
      gsap.to(heroTransitionRef.current, {
        scrollTrigger: {
          trigger: ".hero-wrapper",
          start: "80% bottom",
          end: "bottom bottom",
          scrub: true,
        },
        opacity: 1,
      });
    });

    return () => mm.revert();
  }, []);

  return (
    <section className="hero-wrapper" id="hero" data-nav-theme="dark">
      <div className="hero-sticky">
        <div className="hero-canvas">
          <ThreeScene />
        </div>
        <div className="hero-text-container">
          <h1 className="hero-title cormorant-italic title-top">Light</h1>
          <h1 className="hero-title cormorant-italic title-bottom">Wakes.</h1>
        </div>
        <div className="hero-transition-plane" ref={heroTransitionRef}></div>
        <div className="hero-scroll-indicator">
          <span>Scroll</span>
          <div className="hero-scroll-line"></div>
        </div>
      </div>
    </section>
  );
}
