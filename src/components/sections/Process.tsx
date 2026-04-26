"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function Process() {
  const processRef = useRef<HTMLDivElement>(null);
  const stepsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      if (!processRef.current || !stepsRef.current) return;

      const processSteps = stepsRef.current.querySelectorAll(".process-step");
      const svgPaths = document.querySelectorAll(".process-svg path");
      
      const tlProcess = gsap.timeline({
        scrollTrigger: {
          trigger: processRef.current,
          start: "top top",
          end: "bottom bottom",
          scrub: 1,
        }
      });

      // Reset step texts
      gsap.set(processSteps, { autoAlpha: 0, x: 40 });
      gsap.set(processSteps[0], { autoAlpha: 1, x: 0 });

      // Setup SVG paths
      svgPaths.forEach((path) => {
        const length = (path as SVGPathElement).getTotalLength();
        gsap.set(path, { strokeDasharray: length, strokeDashoffset: length });
      });

      // 1 to 2
      tlProcess.add("step1Out")
               .to(processSteps[0], { autoAlpha: 0, x: -40, duration: 0.4 }, "step1Out")
               .to(".process-line-progress", { width: "50%", duration: 1 }, "step1Out")
               .to(".path-room", { strokeDashoffset: 0, duration: 1 }, "step1Out")
               .to(processSteps[1], { autoAlpha: 1, x: 0, duration: 0.4 }, "step1Out+=0.5");
      
      tlProcess.add("pause1", "+=0.5");
      
      // 2 to 3
      tlProcess.add("step2Out", "pause1")
               .to(processSteps[1], { autoAlpha: 0, x: -40, duration: 0.4 }, "step2Out")
               .to(".process-line-progress", { width: "100%", duration: 1 }, "step2Out")
               .to(".path-furniture", { strokeDashoffset: 0, duration: 1 }, "step2Out")
               .to(processSteps[2], { autoAlpha: 1, x: 0, duration: 0.4 }, "step2Out+=0.5");

      tlProcess.add("pause2", "+=0.5");

      // Final step: light rays
      tlProcess.to(".path-lights", { strokeDashoffset: 0, duration: 0.5 }, "pause2");
    });

    return () => mm.revert();
  }, []);

  return (
    <section id="process" className="process-wrapper process-section" ref={processRef} data-nav-theme="dark" style={{ height: '400vh' }}>
      <div className="process-sticky" style={{ display: 'flex', width: '100%' }}>
        <div className="process-left" style={{ width: '50%', position: 'relative', height: '100%' }}>
          <div className="process-steps" ref={stepsRef}>
            <div className="process-step" style={{ paddingLeft: '10vw' }}>
              <div>
                <h3 className="process-title cormorant-italic">Discovery</h3>
                <p className="process-desc">We begin by listening. Understanding the narrative of the space, the people who will inhabit it, and the hidden potential within the architecture.</p>
              </div>
            </div>
            <div className="process-step" style={{ paddingLeft: '10vw' }}>
              <div>
                <h3 className="process-title cormorant-italic">Conception</h3>
                <p className="process-desc">Drafting the visual language. Selecting materials, shaping the light, and curating art pieces that will define the atmosphere of the interior.</p>
              </div>
            </div>
            <div className="process-step" style={{ paddingLeft: '10vw' }}>
              <div>
                <h3 className="process-title cormorant-italic">Realisation</h3>
                <p className="process-desc">Bringing the vision to life through meticulous craftsmanship and precise execution, ensuring every detail aligns perfectly with the initial concept.</p>
              </div>
            </div>
          </div>
          <div className="process-line-container" style={{ left: '10vw', width: '80%' }}>
            <div className="process-line-progress"></div>
          </div>
        </div>
        
        <div className="process-right" style={{ width: '50%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg className="process-svg" viewBox="0 0 800 800" style={{ width: '100%', height: 'auto', maxWidth: '700px' }} fill="none" stroke="rgba(255, 255, 255, 0.4)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {/* Phase 1: Discovery (Room Architecture) */}
            {/* Outer Wall */}
            <path className="path-room" d="M 150 150 L 650 150 L 650 650 L 150 650 Z" />
            {/* Inner Wall Thickness */}
            <path className="path-room" d="M 170 170 L 630 170 L 630 630 L 170 630 Z" />
            {/* Windows & Doors Indicators */}
            <path className="path-room" d="M 300 150 L 300 170 M 500 150 L 500 170 M 150 400 L 170 400 M 630 350 L 650 350 M 630 450 L 650 450" />
            {/* Architectural Grid / Guidelines */}
            <path className="path-room" strokeWidth="0.5" d="M 400 100 L 400 700 M 100 400 L 700 400" />

            {/* Phase 2: Conception (Interior Layout & Furniture) */}
            {/* Dining Area (Right side) */}
            <path className="path-furniture" d="M 500 300 A 60 60 0 1 0 500 420 A 60 60 0 1 0 500 300" /> {/* Table */}
            <path className="path-furniture" d="M 500 270 A 15 15 0 1 0 500 300 A 15 15 0 1 0 500 270" /> {/* Chair N */}
            <path className="path-furniture" d="M 500 420 A 15 15 0 1 0 500 450 A 15 15 0 1 0 500 420" /> {/* Chair S */}
            <path className="path-furniture" d="M 410 360 A 15 15 0 1 0 440 360 A 15 15 0 1 0 410 360" /> {/* Chair W */}
            <path className="path-furniture" d="M 560 360 A 15 15 0 1 0 590 360 A 15 15 0 1 0 560 360" /> {/* Chair E */}
            
            {/* Living Area (Left side) */}
            {/* L-Sofa */}
            <path className="path-furniture" d="M 220 300 L 360 300 L 360 360 L 280 360 L 280 500 L 220 500 Z" />
            {/* Coffee Table */}
            <path className="path-furniture" d="M 310 400 L 390 400 L 390 480 L 310 480 Z" />
            {/* Lounge Chair */}
            <path className="path-furniture" d="M 420 520 L 480 520 L 480 580 L 420 580 Z" />
            
            {/* Sideboard / Console */}
            <path className="path-furniture" d="M 250 600 L 450 600 L 450 630 L 250 630 Z" />
            
            {/* Plants / Decor */}
            <path className="path-furniture" d="M 200 200 A 20 20 0 1 0 200 240 A 20 20 0 1 0 200 200" />
            <path className="path-furniture" d="M 600 600 A 20 20 0 1 0 600 640 A 20 20 0 1 0 600 600" />

            {/* Phase 3: Realisation (Lighting Design & Photometrics) */}
            {/* Dining Pendant Lighting */}
            <path className="path-lights" stroke="var(--gold)" strokeWidth="2" d="M 500 360 L 420 280 M 500 360 L 580 280 M 500 360 L 580 440 M 500 360 L 420 440" />
            <path className="path-lights" stroke="var(--gold)" strokeWidth="1" d="M 500 240 A 120 120 0 1 0 500 480 A 120 120 0 1 0 500 240" />
            
            {/* Floor Lamp by Sofa */}
            <path className="path-lights" stroke="var(--gold)" strokeWidth="2" d="M 200 380 L 280 300 M 200 380 L 280 460" />
            <path className="path-lights" stroke="var(--gold)" strokeWidth="1" d="M 280 300 A 113 113 0 0 1 280 460" />
            
            {/* Wall Sconce Left */}
            <path className="path-lights" stroke="var(--gold)" strokeWidth="2" d="M 170 480 L 250 420 M 170 480 L 250 540" />
            <path className="path-lights" stroke="var(--gold)" strokeWidth="1" d="M 250 420 A 100 100 0 0 1 250 540" />

            {/* Accent lighting on Console */}
            <path className="path-lights" stroke="var(--gold)" strokeWidth="2" d="M 300 630 L 260 550 M 400 630 L 440 550" />
          </svg>
        </div>
      </div>
    </section>
  );
}
