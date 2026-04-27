"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";

export default function LightStudy() {
  const revealRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLElement>(null);
  const rafIdRef = useRef<number>(0);
  const isVisibleRef = useRef(true);
  const mousePosRef = useRef({ x: 0, y: 0 });
  const currentPosRef = useRef({ x: 0, y: 0 });
  const containerRectRef = useRef({ left: 0, top: 0, width: 0, height: 0 });
  const isMobileRef = useRef(false);
  const lerpFactorRef = useRef(0.28);
  const radiusRef = useRef(150);
  const isInitializedRef = useRef(false);

  // Update dimensions and mobile state
  const updateDimensions = () => {
    isMobileRef.current = window.innerWidth < 768;
    lerpFactorRef.current = isMobileRef.current ? 0.35 : 0.28;
    radiusRef.current = isMobileRef.current ? 75 : 150;
    
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      containerRectRef.current = { 
        left: rect.left, 
        top: rect.top, 
        width: rect.width, 
        height: rect.height 
      };
    }
  };

  useEffect(() => {
    // Initialize mouse position in center
    mousePosRef.current = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    currentPosRef.current = { x: window.innerWidth / 2, y: window.innerHeight / 2 };

    // Initial dimension calculation
    updateDimensions();
    isInitializedRef.current = true;

    // FIXED: Use IntersectionObserver to pause animation when off-screen
    // This is the key fix - stop the RAF loop when section is not visible
    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisibleRef.current = entry.isIntersecting;
      },
      { threshold: 0 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    // Pointer move handler
    const handlePointerMove = (e: PointerEvent | TouchEvent) => {
      const clientX = 'touches' in e ? e.touches[0].clientX : (e as PointerEvent).clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : (e as PointerEvent).clientY;
      mousePosRef.current = { x: clientX, y: clientY };
    };

    // FIXED: Use passive scroll listener with proper throttling
    let scrollRAF: number = 0;
    const handleScroll = () => {
      if (scrollRAF) return;
      scrollRAF = requestAnimationFrame(() => {
        updateDimensions();
        scrollRAF = 0;
      });
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("touchmove", handlePointerMove, { passive: true });
    window.addEventListener("scroll", handleScroll, { passive: true });

    // FIXED: RAF loop now checks isVisibleRef before animating
    let lastTime = 0;
    const frameInterval = 16;

    const update = (time: number) => {
      // Only animate when visible - this is the key optimization
      if (isVisibleRef.current && isInitializedRef.current) {
        if (time - lastTime >= frameInterval) {
          lastTime = time;

          if (revealRef.current) {
            const lerpFactor = lerpFactorRef.current;
            const radius = radiusRef.current;
            
            // Lerp calculation
            currentPosRef.current.x += (mousePosRef.current.x - currentPosRef.current.x) * lerpFactor;
            currentPosRef.current.y += (mousePosRef.current.y - currentPosRef.current.y) * lerpFactor;

            // Calculate position relative to container
            const x = currentPosRef.current.x - containerRectRef.current.left;
            const y = currentPosRef.current.y - containerRectRef.current.top;

            revealRef.current.style.clipPath = `circle(${radius}px at ${x}px ${y}px)`;
          }
        }
      }
      rafIdRef.current = requestAnimationFrame(update);
    };

    rafIdRef.current = requestAnimationFrame(update);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("touchmove", handlePointerMove);
      window.removeEventListener("scroll", handleScroll);
      if (scrollRAF) cancelAnimationFrame(scrollRAF);
      cancelAnimationFrame(rafIdRef.current);
      observer.disconnect();
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
