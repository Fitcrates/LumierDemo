"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import Image from "next/image";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function About() {
  const aboutRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      if (!aboutRef.current) return;

      // FIXED: Lighter parallax with less range for smoother performance
      gsap.to(".about-img-inner", {
        scrollTrigger: {
          trigger: aboutRef.current,
          start: "top bottom",
          end: "bottom top",
          scrub: 0.5, // Added slight smoothing instead of true (instant)
        },
        y: "-40px", // Reduced from -60px for less GPU work
        ease: "none",
        force3D: true,
      });

      gsap.to(".about-text-container", {
        scrollTrigger: {
          trigger: aboutRef.current,
          start: "top 80%",
        },
        y: 0,
        duration: 1.2,
        ease: "power3.out"
      });
    });

    return () => mm.revert();
  }, []);

  return (
    <section className="about-section" id="about" ref={aboutRef} data-nav-theme="light">
      <div className="about-img-container">
        <div className="about-img-border"></div>
        <div className="about-img-wrapper">
          <Image 
            src="/images/Atelier.webp" 
            alt="Lumière Atelier Studio Workspace" 
            className="about-img-inner" 
            width={800} 
            height={1200} 
            sizes="(max-width: 768px) 100vw, 50vw"
            priority // FIXED: Priority loading to prevent jank during parallax
          />
        </div>
      </div>
      <div className="about-text-container">
        <h2 className="about-title cormorant-italic">Atelier</h2>
        <div className="about-desc">
          <p>Lumière is a multidisciplinary design studio focused on creating spaces that evoke emotion. We believe in the power of light, texture, and silence.</p>
          <p>Our process is rooted in a deep understanding of architecture and an obsessive attention to detail, curating every element from the ground up.</p>
          <p>With studios in Paris, Vienna, and Warsaw, we bring a European sensibility to global projects.</p>
        </div>
        <div className="about-sig cormorant-italic">Sophie L.</div>
      </div>
    </section>
  );
}
