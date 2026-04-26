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

    const handleMouseMove = (e: MouseEvent) => {
      mousePos.x = e.clientX;
      mousePos.y = e.clientY;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        mousePos.x = e.touches[0].clientX;
        mousePos.y = e.touches[0].clientY;
      }
    };

    // Listen on window to track mouse globally even before reaching the section
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("touchmove", handleTouchMove, { passive: true });

    let rafId: number;

    const update = () => {
      if (revealRef.current && containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();

        // Only calculate and update if section is within the viewport
        if (rect.top <= window.innerHeight && rect.bottom >= 0) {
          // Lerp current position to mouse position for smooth trailing effect
          currentPos.x += (mousePos.x - currentPos.x) * 0.15;
          currentPos.y += (mousePos.y - currentPos.y) * 0.15;

          // x and y relative to the container
          const x = currentPos.x - rect.left;
          const y = currentPos.y - rect.top;

          const radius = window.innerWidth < 768 ? 75 : 150;

          revealRef.current.style.clipPath = `circle(${radius}px at ${x}px ${y}px)`;
        }
      }
      rafId = requestAnimationFrame(update);
    };

    rafId = requestAnimationFrame(update);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("touchmove", handleTouchMove);
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
      />

      {/* Light version revealed by clipPath */}
      <div
        ref={revealRef}
        className="light-reveal"
        style={{
          position: "absolute",
          inset: 0,
          clipPath: "circle(0px at 50% 50%)",
          willChange: "clip-path",
          pointerEvents: "none"
        }}
      >
        <Image
          src="/images/LightMode.webp"
          alt="Light Interior Design Rendering"
          fill
          sizes="100vw"
          style={{ objectFit: "cover", pointerEvents: "none" }}
        />
      </div>
    </section>
  );
}
