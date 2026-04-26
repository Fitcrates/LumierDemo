"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function Contact() {
  const contactRef = useRef<HTMLDivElement>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState("Less than €10k");
  const budgetOptions = ["Less than €10k", "€10k - €50k", "€50k+"];
  useEffect(() => {
    const mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      if (!contactRef.current) return;

      // Animate text slide in
      gsap.fromTo(".contact-title-1",
        { x: -80, opacity: 0 },
        {
          scrollTrigger: { trigger: contactRef.current, start: "top 70%" },
          x: 0, opacity: 1, duration: 1.1, ease: "power3.out"
        }
      );
      gsap.fromTo(".contact-title-2",
        { x: 80, opacity: 0 },
        {
          scrollTrigger: { trigger: contactRef.current, start: "top 70%" },
          x: 0, opacity: 1, duration: 1.1, ease: "power3.out"
        }
      );

      // Sand dispersion effect on scroll
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: contactRef.current,
          start: "center 70%",
          end: "bottom bottom",
          scrub: 1,
        }
      });

      tl.to(".sand-blur", { attr: { stdDeviation: "30 0" }, duration: 1 }, 0)
        .to(".sand-offset", { attr: { dx: 60 }, duration: 1 }, 0)
        .to(".sand-disp", { attr: { scale: 120 }, duration: 1 }, 0);
    });

    return () => mm.revert();
  }, []);

  // Update text shadow to force SVG filter application in some browsers
  return (
    <section className="contact-section" id="contact" ref={contactRef} data-nav-theme="light">
      <svg width="0" height="0" style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden' }}>
        <defs>
          <filter id="sand-storm" x="-20%" y="-20%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="0 0" result="BLUR" className="sand-blur" />
            <feOffset dx="0" dy="0" in="BLUR" result="OFFSET_BLUR" className="sand-offset" />
            <feTurbulence type="fractalNoise" baseFrequency="0.05 0.05" numOctaves="3" result="NOISE" />
            <feDisplacementMap in="OFFSET_BLUR" in2="NOISE" scale="0" xChannelSelector="R" yChannelSelector="G" result="DISPLACED" className="sand-disp" />
            <feComponentTransfer in="DISPLACED" result="PARTICLES">
              <feFuncA type="linear" slope="5" intercept="-1" />
            </feComponentTransfer>
            <feMerge>
              <feMergeNode in="PARTICLES" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
      </svg>

      <div style={{ filter: "url(#sand-storm)" }}>
        <div className="contact-title-1">Let's work</div>
        <div className="contact-title-2">together.</div>
      </div>

      <div className="contact-actions">
        <button className="contact-cta-btn" onClick={() => setIsModalOpen(true)}>
          Start a Project
        </button>
        <a href="mailto:hello@lumiere.com" className="contact-email-wrapper">
          <div className="contact-email">hello@lumiere.com</div>
          <div className="contact-email-line"></div>
        </a>
      </div>

      <div className="contact-locations">Warsaw · Vienna · Paris</div>

      {/* Modal */}
      <div className={`contact-modal ${isModalOpen ? 'is-open' : ''}`}>
        <div className="contact-modal-backdrop" onClick={() => setIsModalOpen(false)} aria-hidden="true"></div>
        <div className="contact-modal-content" role="dialog" aria-labelledby="modal-title" aria-modal="true">
          <button className="contact-modal-close" onClick={() => setIsModalOpen(false)} aria-label="Close modal">
            <span></span>
            <span></span>
          </button>
          
          <h3 id="modal-title" className="contact-modal-title cormorant-italic">Inquire</h3>
          <form className="contact-form" onSubmit={(e) => { e.preventDefault(); setIsModalOpen(false); }}>
            <div className="form-group">
              <label htmlFor="contact-name">Name</label>
              <input id="contact-name" type="text" required placeholder="John Doe" />
            </div>
            <div className="form-group">
              <label htmlFor="contact-email">Email</label>
              <input id="contact-email" type="email" required placeholder="john@example.com" />
            </div>
            <div className="form-group custom-dropdown-group">
              <label id="budget-label">Budget</label>
              <div className="custom-select-wrapper">
                <button
                  type="button"
                  className={`custom-select-trigger ${isDropdownOpen ? 'open' : ''}`}
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  aria-haspopup="listbox"
                  aria-expanded={isDropdownOpen}
                  aria-labelledby="budget-label"
                >
                  <span>{selectedBudget}</span>
                  <span className="custom-select-arrow"></span>
                </button>
                <ul 
                  className={`custom-select-options ${isDropdownOpen ? 'open' : ''}`} 
                  role="listbox" 
                  aria-labelledby="budget-label"
                >
                  {budgetOptions.map(option => (
                    <li 
                      key={option} 
                      className={`custom-select-option ${selectedBudget === option ? 'selected' : ''}`}
                      onClick={() => {
                        setSelectedBudget(option);
                        setIsDropdownOpen(false);
                      }}
                      role="option"
                      aria-selected={selectedBudget === option}
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          setSelectedBudget(option);
                          setIsDropdownOpen(false);
                        }
                      }}
                    >
                      {option}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="contact-message">Message</label>
              <textarea id="contact-message" rows={4} required placeholder="Tell us about your project..."></textarea>
            </div>
            <button type="submit" className="form-submit-btn">Send Message</button>
          </form>
        </div>
      </div>
    </section>
  );
}
