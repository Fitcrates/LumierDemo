"use client";

import { useEffect, useRef, useCallback } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import Image from "next/image";

gsap.registerPlugin(ScrollTrigger);

export default function Works() {
  const worksRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const progressRef = useRef(0);
  const rafRef = useRef<number>(0);
  const isVisibleRef = useRef(false);

  // Bezier path sampling
  const getPointOnPath = useCallback((t: number, w: number, h: number) => {
    // Cubic bezier: M 50,0 C 80,15 90,25 80,33 then C 70,45 30,55 20,66 then C 10,77 20,85 50,100
    // We split into 3 segments, each 0-1 within its range
    const segments = [
      { p0: [0.50, 0], p1: [0.80, 0.15], p2: [0.90, 0.25], p3: [0.80, 0.33] },
      { p0: [0.80, 0.33], p1: [0.70, 0.45], p2: [0.30, 0.55], p3: [0.20, 0.66] },
      { p0: [0.20, 0.66], p1: [0.10, 0.77], p2: [0.20, 0.85], p3: [0.50, 1.00] },
    ];

    const segIndex = Math.min(Math.floor(t * 3), 2);
    const segT = (t * 3) - segIndex;
    const seg = segments[segIndex];

    const cubic = (a: number, b: number, c: number, d: number, u: number) => {
      const u2 = u * u;
      const u3 = u2 * u;
      const inv = 1 - u;
      const inv2 = inv * inv;
      const inv3 = inv2 * inv;
      return inv3 * a + 3 * inv2 * u * b + 3 * inv * u2 * c + u3 * d;
    };

    return {
      x: cubic(seg.p0[0], seg.p1[0], seg.p2[0], seg.p3[0], segT) * w,
      y: cubic(seg.p0[1], seg.p1[1], seg.p2[1], seg.p3[1], segT) * h,
    };
  }, []);

  const drawPhoton = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;

    // Set actual pixel dimensions
    if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
      canvas.width = w * dpr;
      canvas.height = h * dpr;
    }

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);

    const progress = progressRef.current;
    if (progress <= 0.001) return;

    // Draw trail
    const trailSpan = 0.10; // how far back the trail extends (in t units)
    const trailSteps = 120; // resolution of trail path

    // Faint guideline path
    ctx.beginPath();
    ctx.strokeStyle = "rgba(191, 140, 58, 0.05)";
    ctx.lineWidth = 1;
    for (let i = 0; i <= 200; i++) {
      const t = i / 200;
      const pt = getPointOnPath(t, w, h);
      if (i === 0) ctx.moveTo(pt.x, pt.y);
      else ctx.lineTo(pt.x, pt.y);
    }
    ctx.stroke();

    // Build trail points array
    const trailPoints: { x: number; y: number; t: number }[] = [];
    for (let i = trailSteps; i >= 0; i--) {
      const trailT = progress - (trailSpan * (i / trailSteps));
      if (trailT < 0) continue;
      const pt = getPointOnPath(Math.min(trailT, 1), w, h);
      trailPoints.push({ x: pt.x, y: pt.y, t: 1 - (i / trailSteps) }); // t: 0=tail, 1=head
    }

    if (trailPoints.length < 2) return;

    // Draw blurred smudge trail using multiple overlapping stroke passes
    // Each pass has different width & opacity for a soft, glowy smear
    const passes = [
      { width: 36, color: (a: number) => `rgba(191, 140, 58, ${0.02 * a})` },
      { width: 22, color: (a: number) => `rgba(220, 170, 70, ${0.04 * a})` },
      { width: 12, color: (a: number) => `rgba(255, 200, 80, ${0.08 * a})` },
      { width: 6, color: (a: number) => `rgba(255, 220, 130, ${0.15 * a})` },
      { width: 3, color: (a: number) => `rgba(255, 240, 200, ${0.25 * a})` },
    ];

    for (const pass of passes) {
      // Draw trail as many short segments with increasing opacity
      for (let i = 1; i < trailPoints.length; i++) {
        const p0 = trailPoints[i - 1];
        const p1 = trailPoints[i];
        const fade = p1.t; // 0 at tail, 1 at head

        ctx.beginPath();
        ctx.moveTo(p0.x, p0.y);
        ctx.lineTo(p1.x, p1.y);
        ctx.strokeStyle = pass.color(fade * fade); // quadratic ease for softer tail
        ctx.lineWidth = pass.width * (0.15 + 0.85 * fade); // thinner at tail
        ctx.lineCap = "round";
        ctx.stroke();
      }
    }

    // Main photon head
    const mainPt = trailPoints[trailPoints.length - 1];

    // Outer glow (large, diffuse)
    const outerGlow = ctx.createRadialGradient(mainPt.x, mainPt.y, 0, mainPt.x, mainPt.y, 50);
    outerGlow.addColorStop(0, "rgba(255, 200, 80, 0.3)");
    outerGlow.addColorStop(0.25, "rgba(191, 140, 58, 0.1)");
    outerGlow.addColorStop(1, "rgba(191, 140, 58, 0)");
    ctx.beginPath();
    ctx.fillStyle = outerGlow;
    ctx.arc(mainPt.x, mainPt.y, 50, 0, Math.PI * 2);
    ctx.fill();

    // Medium glow
    const medGlow = ctx.createRadialGradient(mainPt.x, mainPt.y, 0, mainPt.x, mainPt.y, 20);
    medGlow.addColorStop(0, "rgba(255, 230, 150, 0.7)");
    medGlow.addColorStop(0.4, "rgba(255, 200, 80, 0.25)");
    medGlow.addColorStop(1, "rgba(191, 140, 58, 0)");
    ctx.beginPath();
    ctx.fillStyle = medGlow;
    ctx.arc(mainPt.x, mainPt.y, 20, 0, Math.PI * 2);
    ctx.fill();

    // Bright core
    const coreGlow = ctx.createRadialGradient(mainPt.x, mainPt.y, 0, mainPt.x, mainPt.y, 7);
    coreGlow.addColorStop(0, "rgba(255, 255, 245, 1)");
    coreGlow.addColorStop(0.5, "rgba(255, 225, 140, 0.9)");
    coreGlow.addColorStop(1, "rgba(255, 200, 80, 0)");
    ctx.beginPath();
    ctx.fillStyle = coreGlow;
    ctx.arc(mainPt.x, mainPt.y, 7, 0, Math.PI * 2);
    ctx.fill();

    // White hot center
    ctx.beginPath();
    ctx.fillStyle = "rgba(255, 255, 255, 0.95)";
    ctx.arc(mainPt.x, mainPt.y, 2.5, 0, Math.PI * 2);
    ctx.fill();
  }, [getPointOnPath]);

  useEffect(() => {
    const mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      if (!worksRef.current) return;

      const projects = worksRef.current.querySelectorAll(".project-1, .project-3");
      projects.forEach((proj) => {
        const imgWrapper = proj.querySelector(".project-img-wrapper");
        if (imgWrapper) {
          gsap.to(imgWrapper, {
            scrollTrigger: {
              trigger: proj,
              start: "top 70%",
            },
            clipPath: "inset(0% 0% 0% 0%)",
            duration: 1.2,
            ease: "power3.inOut"
          });
        }
      });

      // Project 2 parallax
      gsap.fromTo(".project-2 .project-img-inner",
        { scale: 1.08 },
        {
          scrollTrigger: {
            trigger: ".project-2",
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
          scale: 1.0,
          force3D: true,
          ease: "none"
        }
      );

      // Photon particle scroll progress
      const progressObj = { value: 0 };
      gsap.to(progressObj, {
        scrollTrigger: {
          trigger: worksRef.current,
          start: "top center",
          end: "bottom center",
          scrub: 0.8,
          onUpdate: (self) => {
            progressObj.value = self.progress;
            progressRef.current = self.progress;
          },
        },
        value: 1,
        ease: "none",
      });
    });

    // Animation loop — only runs when section is visible
    const animate = () => {
      if (isVisibleRef.current) {
        drawPhoton();
      }
      rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);

    // Pause rAF rendering when off-screen
    const observer = new IntersectionObserver(
      ([entry]) => { isVisibleRef.current = entry.isIntersecting; },
      { threshold: 0 }
    );
    if (worksRef.current) observer.observe(worksRef.current);

    // Handle resize
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (canvas) {
        const dpr = window.devicePixelRatio || 1;
        canvas.width = canvas.clientWidth * dpr;
        canvas.height = canvas.clientHeight * dpr;
      }
    };
    window.addEventListener("resize", handleResize);

    return () => {
      mm.revert();
      cancelAnimationFrame(rafRef.current);
      observer.disconnect();
      window.removeEventListener("resize", handleResize);
    };
  }, [drawPhoton]);

  return (
    <section className="works-section" id="works" ref={worksRef} style={{ position: "relative" }}>
      <canvas
        ref={canvasRef}
        className="works-photon-canvas"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none",
          zIndex: 5,
        }}
      />

      <div className="project project-1" data-nav-theme="dark">
        <div className="project-img-wrapper">
          <Image src="/images/NoirWorks.webp" alt="Villa Noir Interior Architecture" className="project-img-inner" width={1600} height={1200} sizes="(max-width: 768px) 100vw, 50vw" unoptimized />
        </div>
        <div className="project-text">
          <div className="project-year">24</div>
          <h3 className="project-name cormorant-italic">Villa Noir</h3>
          <div className="project-loc">Vienna · Austria</div>
        </div>
      </div>

      <div className="project project-2" data-nav-theme="light">
        <div className="project-img-wrapper">
          <Image src="/images/ParisAtelier.webp" alt="L'Atelier The Glasshouse Interior" className="project-img-inner" width={1600} height={1200} sizes="(max-width: 768px) 100vw, 100vw" unoptimized />
          <div className="project-overlay"></div>
        </div>
        <div className="project-text">
          <div className="project-loc">Paris · France</div>
          <h3 className="project-name cormorant-italic ">L' Atelier</h3>
        </div>
      </div>

      <div className="project project-3" data-nav-theme="light">
        <div className="project-img-wrapper">
          <Image src="/images/AlpineWorks.webp" alt="Alpine Retreat Living Room" className="project-img-inner" width={1600} height={1200} sizes="(max-width: 768px) 100vw, 50vw" unoptimized />
        </div>
        <div className="project-text">
          <div className="project-year">23</div>
          <h3 className="project-name cormorant-italic">Alpine</h3>
          <div className="project-loc">Warsaw · Poland</div>
        </div>
      </div>
    </section>
  );
}
