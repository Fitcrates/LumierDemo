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

    // OPTIMIZED: Use direct DOM manipulation instead of gsap.set() in render loop
    // This is much faster than gsap.set() at 60fps
    const ringElement = ringRef.current;
    const dotElement = dotRef.current;
    const glowElement = glowRef.current;

    const onMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      // Direct transform for dot - instant follow
      if (dotElement) {
        dotElement.style.transform = `translate(${mouseX}px, ${mouseY}px)`;
      }

      // Glow follows with slight delay via GSAP - on every move
      if (glowElement) {
        gsap.to(glowElement, {
          x: mouseX,
          y: mouseY,
          duration: 0.6,
          ease: "power2.out",
          overwrite: "auto"
        });
      }

      // Check hover states
      const target = e.target as HTMLElement;
      if (target.closest('a') || target.closest('button') || target.closest('.service-row') || target.closest('.project-img-wrapper')) {
        ringRef.current?.classList.add('hover');
      } else {
        ringRef.current?.classList.remove('hover');
      }

      // Only trigger GSAP for glow opacity changes (not position in render loop)
      if (glowElement) {
        const closestSection = target.closest('[data-nav-theme]');
        const isLight = closestSection?.getAttribute('data-nav-theme') === 'light';
        gsap.to(glowElement, {
          opacity: isLight ? 0 : 1,
          duration: 0.3,
          overwrite: "auto"
        });
      }
    };

    window.addEventListener("mousemove", onMouseMove);

    // FIXED: Render loop for ring lerp - use direct DOM with visibility check
    let rafId: number;
    let isWindowFocused = true;

    const handleVisibilityChange = () => {
      isWindowFocused = !document.hidden;
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    const render = () => {
      // Only animate when window is focused - saves CPU when tab is background
      if (isWindowFocused) {
        ringX += (mouseX - ringX) * 0.08;
        ringY += (mouseY - ringY) * 0.08;

        if (ringElement) {
          // Direct transform is faster than gsap.set()
          ringElement.style.transform = `translate(${ringX}px, ${ringY}px) translate(-50%, -50%)`;
        }
      }

      rafId = requestAnimationFrame(render);
    };
    
    render();

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      cancelAnimationFrame(rafId);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
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
