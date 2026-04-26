"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

export default function Cursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!dotRef.current || !ringRef.current || !glowRef.current) return;

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let ringX = mouseX;
    let ringY = mouseY;

    const onMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      if (dotRef.current) {
        gsap.to(dotRef.current, {
          x: mouseX,
          y: mouseY,
          duration: 0, // instant
        });
      }

      if (glowRef.current) {
        gsap.to(glowRef.current, {
          x: mouseX,
          y: mouseY,
          duration: 0.6,
          ease: "power2.out",
        });
      }

      // Check hover states
      const target = e.target as HTMLElement;
      if (target.closest('a') || target.closest('button') || target.closest('.service-row') || target.closest('.project-img-wrapper')) {
        ringRef.current?.classList.add('hover');
      } else {
        ringRef.current?.classList.remove('hover');
      }

      if (glowRef.current) {
        const closestSection = target.closest('[data-nav-theme]');
        const isLight = closestSection?.getAttribute('data-nav-theme') === 'light';
        gsap.to(glowRef.current, {
          opacity: isLight ? 0 : 1,
          duration: 0.3
        });
      }
    };

    window.addEventListener("mousemove", onMouseMove);

    // Render loop for lerp
    const render = () => {
      ringX += (mouseX - ringX) * 0.08;
      ringY += (mouseY - ringY) * 0.08;

      if (ringRef.current) {
        // We only translate here, the hover scale is handled via CSS classes
        gsap.set(ringRef.current, {
          left: ringX,
          top: ringY,
          xPercent: -50,
          yPercent: -50
        });
      }

      requestAnimationFrame(render);
    };
    
    render();

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
    };
  }, []);

  return (
    <>
      <div ref={glowRef} className="cursor-glow" />
      <div ref={dotRef} className="cursor-dot" />
      <div ref={ringRef} className="cursor-ring" />
    </>
  );
}
