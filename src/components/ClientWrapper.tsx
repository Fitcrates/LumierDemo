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
    // Initialize Lenis - try with wheel-friendly settings
    // KEY: The issue is likely with wheel event handling
    const lenis = new Lenis({
      duration: 0.8, // Faster for more responsive wheel feel
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true, // Enable smooth wheel - but with proper settings
      wheelMultiplier: 1,
      infinite: false,
      touchMultiplier: 2,
      // Use native wheel smoothing - this is key for wheel jank
      lerp: 0.05, // Very low lerp = more responsive to wheel
    });

    lenisRef.current = lenis;

    // FIXED: Proper Lenis + GSAP integration
    // Use GSAP ticker to drive Lenis
    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });

    // FIXED: Sync ScrollTrigger with Lenis - minimal updates
    let scrollTriggerUpdatePending = false;
    lenis.on('scroll', () => {
      if (!scrollTriggerUpdatePending) {
        scrollTriggerUpdatePending = true;
        requestAnimationFrame(() => {
          ScrollTrigger.update();
          scrollTriggerUpdatePending = false;
        });
      }
    });

    // Disable lag smoothing for wheel - this can cause jank
    gsap.ticker.lagSmoothing(0);

    // Set GSAP ticker to use requestAnimationFrame
    gsap.ticker.fps(60);

    return () => {
      lenis.destroy();
      gsap.ticker.remove((time) => {
        lenis.raf(time * 1000);
      });
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
