"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

export default function Cursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!dotRef.current || !ringRef.current || !glowRef.current) return;

    // CRITICAL FIX: Hide cursor on mobile/touch devices
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    if (isTouchDevice) {
      if (dotRef.current) dotRef.current.style.display = 'none';
      if (ringRef.current) ringRef.current.style.display = 'none';
      if (glowRef.current) glowRef.current.style.display = 'none';
      return; // Exit early - no cursor logic needed on touch devices
    }

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let ringX = mouseX;
    let ringY = mouseY;
    let glowX = mouseX;
    let glowY = mouseY;

    const ringElement = ringRef.current;
    const dotElement = dotRef.current;
    const glowElement = glowRef.current;

    // CRITICAL FIX: Use quickTo for glow - reuses single tween instead of creating new ones
    const glowQuickX = gsap.quickTo(glowElement, "x", { duration: 0.6, ease: "power2.out" });
    const glowQuickY = gsap.quickTo(glowElement, "y", { duration: 0.6, ease: "power2.out" });
    
    // Reusable tween for opacity changes
    let currentOpacity = 1;
    const glowOpacityTween = gsap.to(glowElement, { 
      opacity: 1, 
      duration: 0.3, 
      paused: true 
    });

    const onMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      // Direct transform for dot - instant follow
      if (dotElement) {
        dotElement.style.transform = `translate(${mouseX}px, ${mouseY}px)`;
      }

      // FIXED: Use quickTo instead of gsap.to() - much more efficient
      glowQuickX(mouseX);
      glowQuickY(mouseY);

      // Check hover states
      const target = e.target as HTMLElement;
      if (target.closest('a') || target.closest('button') || target.closest('.service-row') || target.closest('.project-img-wrapper')) {
        ringRef.current?.classList.add('hover');
      } else {
        ringRef.current?.classList.remove('hover');
      }

      // FIXED: Only update opacity if it actually changed
      const closestSection = target.closest('[data-nav-theme]');
      const isLight = closestSection?.getAttribute('data-nav-theme') === 'light';
      const targetOpacity = isLight ? 0 : 1;
      
      if (targetOpacity !== currentOpacity) {
        currentOpacity = targetOpacity;
        glowOpacityTween.vars.opacity = targetOpacity;
        glowOpacityTween.invalidate().restart();
      }
    };

    window.addEventListener("mousemove", onMouseMove, { passive: true });

    // FIXED: Render loop with visibility check
    let rafId: number;
    let isWindowFocused = true;

    const handleVisibilityChange = () => {
      isWindowFocused = !document.hidden;
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    const render = () => {
      if (isWindowFocused) {
        // Lerp for ring
        ringX += (mouseX - ringX) * 0.08;
        ringY += (mouseY - ringY) * 0.08;

        if (ringElement) {
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
      glowOpacityTween.kill();
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
