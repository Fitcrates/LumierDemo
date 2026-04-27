"use client";

import { useEffect, useState } from "react";
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

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      infinite: false,
    });

    // OPTIMIZED: Use single RAF loop - Lenis handles its own internal RAF
    // Just sync ScrollTrigger with Lenis scroll events
    lenis.on('scroll', ScrollTrigger.update);

    // Use GSAP ticker for smooth sync (handles time better than raw RAF)
    // This is the recommended way to integrate Lenis with GSAP
    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });

    // Keep lag smoothing enabled (default 400ms) to smooth out frame drops
    // gsap.ticker.lagSmoothing(0); // REMOVED - was causing stuttering

    // Set GSAP ticker to use requestAnimationFrame (default)
    gsap.ticker.fps(60);

    return () => {
      lenis.destroy();
      gsap.ticker.remove((time) => {
        lenis.raf(time * 1000);
      });
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
