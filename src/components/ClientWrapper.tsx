"use client";

import { useEffect, useState, useRef } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollToPlugin } from "gsap/dist/ScrollToPlugin";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import Cursor from "./Cursor";
import Loader from "./Loader";
import Nav from "./Nav";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);
}

export default function ClientWrapper({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    // FIXED: Detect mobile for optimized settings
    const isMobile = window.innerWidth < 768;
    
    // Initialize Lenis with mobile-optimized settings
    const lenis = new Lenis({
      duration: isMobile ? 0.8 : 1.0, // Slower on mobile = smoother
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: !isMobile, // Disable smooth wheel on mobile - native is better
      wheelMultiplier: 1,
      infinite: false,
      touchMultiplier: isMobile ? 1.2 : 1.5, // Lower on mobile
      lerp: isMobile ? 0.15 : 0.1, // Higher lerp on mobile = less inertia
    });

    lenisRef.current = lenis;

    // FIXED: Proper Lenis + GSAP integration with throttling
    const rafCallback = (time: number) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(rafCallback);

    // CRITICAL FIX: Throttle ScrollTrigger updates to every 2 frames on mobile
    let scrollTriggerUpdatePending = false;
    let frameCount = 0;
    const updateThrottle = isMobile ? 2 : 1; // Update every 2nd frame on mobile
    
    lenis.on('scroll', () => {
      frameCount++;
      if (!scrollTriggerUpdatePending && frameCount >= updateThrottle) {
        scrollTriggerUpdatePending = true;
        frameCount = 0;
        requestAnimationFrame(() => {
          ScrollTrigger.update();
          scrollTriggerUpdatePending = false;
        });
      }
    });

    // Disable lag smoothing - prevents jank on irregular frame times
    gsap.ticker.lagSmoothing(0);

    return () => {
      lenis.destroy();
      gsap.ticker.remove(rafCallback);
      lenisRef.current = null;
    };
  }, []);

  return (
    <>
      {loading && <Loader onComplete={() => setLoading(false)} />}
      <Cursor />
      <Nav />
      <div className="grain-overlay"></div>
      <main style={{ opacity: loading ? 0 : 1, transition: "opacity 0.6s ease" }}>
        {children}
      </main>
    </>
  );
}
