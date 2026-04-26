"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import SplitType from "split-type";

export default function Loader({ onComplete }: { onComplete: () => void }) {
  const titleRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!titleRef.current || !containerRef.current) return;

    // Split text
    const splitText = new SplitType(titleRef.current, { types: "chars" });
    
    // Add char wrapper for clipping
    if (splitText.chars) {
      splitText.chars.forEach(char => {
        const wrapper = document.createElement('div');
        wrapper.style.display = 'inline-block';
        wrapper.style.overflow = 'hidden';
        wrapper.style.verticalAlign = 'top';
        char.parentNode?.insertBefore(wrapper, char);
        wrapper.appendChild(char);
      });
    }

    const tl = gsap.timeline({
      onComplete: () => {
        if (splitText.chars) {
          splitText.revert();
        }
        onComplete();
      }
    });

    if (splitText.chars) {
      tl.fromTo(splitText.chars, 
        { y: "100%", opacity: 0 },
        { y: "0%", opacity: 1, duration: 0.8, stagger: 0.05, ease: "power3.out" }
      )
      .to(splitText.chars, 
        { opacity: 0, duration: 0.4, stagger: 0.02, ease: "power2.inOut" }, 
        "+=0.2"
      )
      .to(containerRef.current, {
        opacity: 0,
        duration: 0.6,
        ease: "power2.inOut"
      });
    }

    return () => {
      tl.kill();
      if (splitText.chars) {
        splitText.revert();
      }
    };
  }, [onComplete]);

  return (
    <div ref={containerRef} className="page-loader">
      <div ref={titleRef} className="loader-title">
        LUMIÈRE
      </div>
    </div>
  );
}
