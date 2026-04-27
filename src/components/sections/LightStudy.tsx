"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";

export default function LightStudy() {
  const revealRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    // Start with the mouse in the center of the screen
    const mousePos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const currentPos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };

    // Cache container dimensions - recalculate on scroll for accuracy
    let containerRect = { left: 0, top: 0, width: 0, height: 0 };
    let isInViewport = true;

    const updateContainerRect = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        containerRect = { left: rect.left, top: rect.top, width: rect.width, height: rect.height };
        isInViewport = rect.top <= window.innerHeight && rect.bottom >= 0;
      }
    };

    // Initial rect calculation
    updateContainerRect();

    // Update rect on scroll (throttled) - needed because container moves during scroll
    let scrollTimeout: number;
    const handleScroll = () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = window.setTimeout(updateContainerRect, 50);
    };

    // Update rect on resize
    let resizeTimeout: number;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = window.setTimeout(updateContainerRect, 100);
    };

    // Use pointermove for both mouse and touch - more efficient
    const handlePointerMove = (e: PointerEvent | TouchEvent) => {
      const clientX = 'touches' in e ? e.touches[0].clientX : (e as PointerEvent).clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : (e as PointerEvent).clientY;
      
      mousePos.x = clientX;
      mousePos.y = clientY;
    };

    // Listen on window to track cursor globally
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("touchmove", handlePointerMove, { passive: true });
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleResize);

    // Higher lerp value = faster response, less lag
    // Mobile: even higher for better responsiveness on touch
    // Use window directly - isMobile state is for re-renders only
    const getLerpFactor = () => window.innerWidth < 768 ? 0.35 : 0.28;
    const getRadius = () => window.innerWidth < 768 ? 75 : 150;

    let rafId: number;
    let lastTime = 0;
    const frameInterval = 16;

    const update = (time: number) => {
      if (time - lastTime >= frameInterval) {
        lastTime = time;

        if (revealRef.current && isInViewport) {
          const lerpFactor = getLerpFactor();
          const radius = getRadius();
          
          // Lerp with higher factor for snappier response
          currentPos.x += (mousePos.x - currentPos.x) * lerpFactor;
          currentPos.y += (mousePos.y - currentPos.y) * lerpFactor;

          // Calculate position relative to cached container rect
          const x = currentPos.x - containerRect.left;
          const y = currentPos.y - containerRect.top;

          revealRef.current.style.clipPath = `circle(${radius}px at ${x}px ${y}px)`;
        }
      }
      rafId = requestAnimationFrame(update);
    };

    rafId = requestAnimationFrame(update);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("touchmove", handlePointerMove);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
      clearTimeout(scrollTimeout);
      clearTimeout(resizeTimeout);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <section
      id="light-study"
      ref={containerRef}
      className="light-study"
      data-nav-theme="dark"
      style={{ position: "relative", overflow: "hidden", height: "100vh", cursor: "none" }}
    >
      {/* Dark version */}
      <Image
        src="/images/DarkMode.webp"
        alt="Dark Interior Design Rendering"
        className="light-dark"
        fill
        sizes="100vw"
        style={{ objectFit: "cover" }}
        priority
      />

      {/* Light version revealed by clipPath */}
      <div
        ref={revealRef}
        className="light-reveal"
        style={{
          position: "absolute",
          inset: 0,
          clipPath: "circle(0px at 50% 50%)",
          pointerEvents: "none"
        }}
      >
        <Image
          src="/images/LightMode.webp"
          alt="Light Interior Design Rendering"
          fill
          sizes="100vw"
          style={{ objectFit: "cover", pointerEvents: "none" }}
          priority
        />
      </div>
    </section>
  );
}
