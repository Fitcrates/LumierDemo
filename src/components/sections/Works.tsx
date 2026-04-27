"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import Image from "next/image";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

// Bezier path sampling - moved outside component to avoid re-creation
const getPointOnPath = (t: number, w: number, h: number) => {
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
};

export default function Works() {
  const worksRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const progressRef = useRef(0);
  const rafRef = useRef<number>(0);
  const isVisibleRef = useRef(false);
  const isMobileRef = useRef(false);

  useEffect(() => {
    // Skip photon animation on mobile for performance
    isMobileRef.current = typeof window !== "undefined" && window.innerWidth < 768;
    
    // Hide canvas on mobile
    if (canvasRef.current) {
      canvasRef.current.style.display = isMobileRef.current ? "none" : "block";
    }
    
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

      // Add force3D to image wrappers for GPU acceleration
      gsap.set(".project-img-wrapper", { force3D: true });

      // Photon particle scroll progress - skip on mobile
      if (!isMobileRef.current) {
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
      }
    });

    // Draw function defined inside useEffect - no dependencies to re-run
    const drawPhoton = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d", { alpha: true });
      if (!ctx) return;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;

      if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
        canvas.width = w * dpr;
        canvas.height = h * dpr;
      }

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      const progress = progressRef.current;
      if (progress <= 0.001) return;

      const trailSpan = 0.10;
      const trailSteps = 40;

      // Draw guideline
      ctx.beginPath();
      ctx.strokeStyle = "rgba(191, 140, 58, 0.05)";
      ctx.lineWidth = 1;
      for (let i = 0; i <= 50; i++) {
        const t = i / 50;
        const pt = getPointOnPath(t, w, h);
        if (i === 0) ctx.moveTo(pt.x, pt.y);
        else ctx.lineTo(pt.x, pt.y);
      }
      ctx.stroke();

      // Build trail points
      const trailPoints: { x: number; y: number; t: number }[] = [];
      for (let i = trailSteps; i >= 0; i--) {
        const trailT = progress - (trailSpan * (i / trailSteps));
        if (trailT < 0) continue;
        const pt = getPointOnPath(Math.min(trailT, 1), w, h);
        trailPoints.push({ x: pt.x, y: pt.y, t: 1 - (i / trailSteps) });
      }

      if (trailPoints.length < 2) return;

      const passes = [
        { width: 30, color: "rgba(191, 140, 58, 0.03)" },
        { width: 16, color: "rgba(255, 200, 80, 0.08)" },
        { width: 6, color: "rgba(255, 220, 130, 0.2)" },
      ];

      for (const pass of passes) {
        ctx.lineWidth = pass.width;
        ctx.lineCap = "round";
        ctx.strokeStyle = pass.color;
        
        ctx.beginPath();
        for (let i = 1; i < trailPoints.length; i++) {
          const p0 = trailPoints[i - 1];
          const p1 = trailPoints[i];
          const fade = p1.t * p1.t;
          
          ctx.globalAlpha = fade;
          ctx.moveTo(p0.x, p0.y);
          ctx.lineTo(p1.x, p1.y);
        }
        ctx.stroke();
        ctx.globalAlpha = 1;
      }

      const mainPt = trailPoints[trailPoints.length - 1];

      // Outer glow
      ctx.beginPath();
      ctx.arc(mainPt.x, mainPt.y, 50, 0, Math.PI * 2);
      const outerGrad = ctx.createRadialGradient(mainPt.x, mainPt.y, 0, mainPt.x, mainPt.y, 50);
      outerGrad.addColorStop(0, "rgba(255, 200, 80, 0.25)");
      outerGrad.addColorStop(0.5, "rgba(191, 140, 58, 0.08)");
      outerGrad.addColorStop(1, "rgba(191, 140, 58, 0)");
      ctx.fillStyle = outerGrad;
      ctx.fill();

      // Medium glow
      ctx.beginPath();
      ctx.arc(mainPt.x, mainPt.y, 20, 0, Math.PI * 2);
      const medGrad = ctx.createRadialGradient(mainPt.x, mainPt.y, 0, mainPt.x, mainPt.y, 20);
      medGrad.addColorStop(0, "rgba(255, 230, 150, 0.6)");
      medGrad.addColorStop(0.5, "rgba(255, 200, 80, 0.2)");
      medGrad.addColorStop(1, "rgba(191, 140, 58, 0)");
      ctx.fillStyle = medGrad;
      ctx.fill();

      // Bright core
      ctx.beginPath();
      ctx.arc(mainPt.x, mainPt.y, 7, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255, 240, 200, 0.9)";
      ctx.fill();

      // White hot center
      ctx.beginPath();
      ctx.arc(mainPt.x, mainPt.y, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255, 255, 255, 0.95)";
      ctx.fill();
    };

    // Animation loop - now properly checks visibility
    let lastRenderedProgress = -1;
    let lastFrameTime = 0;
    const frameInterval = 33;

    const animate = (time: number) => {
      // FIXED: Only render when visible AND has meaningful progress
      // This is the key optimization - skip rendering when off-screen
      if (isVisibleRef.current && !isMobileRef.current && progressRef.current > 0.001) {
        const timeSinceLastFrame = time - lastFrameTime;
        
        if (timeSinceLastFrame >= frameInterval && Math.abs(progressRef.current - lastRenderedProgress) > 0.001) {
          drawPhoton();
          lastRenderedProgress = progressRef.current;
          lastFrameTime = time;
        }
      } else {
        // When not visible, still render occasionally to keep canvas fresh but not every frame
        if (time - lastFrameTime >= 100) {
          lastFrameTime = time;
        }
      }
      rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);

    // Pause rAF rendering when off-screen - use higher threshold for better detection
    const observer = new IntersectionObserver(
      ([entry]) => { 
        isVisibleRef.current = entry.isIntersecting;
        // Clear canvas when not visible to save memory
        if (!entry.isIntersecting && canvasRef.current) {
          const ctx = canvasRef.current.getContext("2d");
          if (ctx) ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        }
      },
      { threshold: 0.1 } // More strict - needs 10% visible
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
  }, []); // Empty deps - effect runs once on mount

  return (
    <section className="works-section" id="works" ref={worksRef} style={{ position: "relative" }}>
      {/* Canvas hidden on mobile via CSS class - photon effect is too heavy for mobile */}
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
          <Image src="/images/noirWorks.webp" alt="Villa Noir Interior Architecture" className="project-img-inner" fill sizes="(max-width: 768px) 100vw, 50vw" />
        </div>
        <div className="project-text">
          <div className="project-year">24</div>
          <h3 className="project-name cormorant-italic">Villa Noir</h3>
          <div className="project-loc">Vienna · Austria</div>
        </div>
      </div>

      <div className="project project-2" data-nav-theme="light">
        <div className="project-img-wrapper">
          <Image src="/images/ParisAtelier.webp" alt="L'Atelier The Glasshouse Interior" className="project-img-inner" fill sizes="(max-width: 768px) 100vw, 100vw" />
          <div className="project-overlay"></div>
        </div>
        <div className="project-text">
          <div className="project-loc">Paris · France</div>
          <h3 className="project-name cormorant-italic ">L' Atelier</h3>
        </div>
      </div>

      <div className="project project-3" data-nav-theme="light">
        <div className="project-img-wrapper">
          <Image src="/images/AlpineWorks.webp" alt="Alpine Retreat Living Room" className="project-img-inner" fill sizes="(max-width: 768px) 100vw, 50vw" />
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
