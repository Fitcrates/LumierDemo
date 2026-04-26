"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

export default function Nav() {
  const navRef = useRef<HTMLElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [visible, setVisible] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const visibleRef = useRef(false);

  useEffect(() => {
    if (bgRef.current) {
      gsap.set(bgRef.current, {
        width: 80,
        height: 80,
        top: 2,
        right: 18,
        borderRadius: "50%",
        clipPath: "none",
      });
    }

    const handleScroll = () => {
      const scrollY = window.scrollY;
      
      // Show nav after passing 80% of viewport height
      const shouldBeVisible = scrollY > window.innerHeight * 0.8;
            if (shouldBeVisible !== visibleRef.current) {
        visibleRef.current = shouldBeVisible;
        setVisible(shouldBeVisible);

        // Animate the bg morph with GSAP (sole authority for shape)
        if (bgRef.current) {
          const isMobile = window.innerWidth <= 768;

          if (shouldBeVisible) {
            // Morph to full-width rectangle
            gsap.to(bgRef.current, {
              width: "100vw",
              height: isMobile ? (window.innerWidth <= 480 ? 60 : 70) : 90,
              top: 0,
              right: 0,
              borderRadius: "0%",
              clipPath: "none",
              duration: 0.7,
              ease: "power4.inOut",
              overwrite: true, // Kill any running tween on this target automatically
            });
          } else {
            // Morph back to corner circle
            gsap.to(bgRef.current, {
              width: 80,
              height: 80,
              top: 2,
              right: 18,
              borderRadius: "50%",
              clipPath: "none",
              duration: 0.7,
              ease: "power4.inOut",
              overwrite: true,
            });
          }
        }
      }


      // Theme detection based on current section
      const sections = document.querySelectorAll('[data-nav-theme]');
      let currentTheme: "dark" | "light" = "dark";
      
      sections.forEach(sec => {
        const rect = sec.getBoundingClientRect();
        if (rect.top <= 100 && rect.bottom >= 100) {
          currentTheme = sec.getAttribute('data-nav-theme') as "dark" | "light";
        }
      });
      
      setTheme(currentTheme);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, target: string) => {
    e.preventDefault();
    gsap.to(window, {
      duration: 1.2,
      scrollTo: target,
      ease: "power3.inOut"
    });
  };

  // Determine bg colors based on theme + visibility
  const bgClass = visible
    ? `nav-hamburger-bg nav-scrolled theme-${theme}`
    : "nav-hamburger-bg nav-top";

  return (
    <>
      <div className={bgClass} ref={bgRef}></div>

      <button 
        className={`nav-hamburger ${visible ? 'hidden' : ''} ${menuOpen ? 'is-open' : ''}`} 
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label={menuOpen ? "Close menu" : "Open menu"}
        aria-expanded={menuOpen}
        aria-controls="fullscreen-menu"
      >
        <span></span>
        <span></span>
      </button>

      <nav ref={navRef} className={`main-nav ${visible ? 'nav-scrolled theme-' + theme : 'nav-top theme-' + theme}`} aria-label="Main Navigation">
        <div className="nav-logo" role="banner" aria-label="Lumière Home">LUMIÈRE</div>
        <div className="nav-links">
          <a href="#services" onClick={(e) => handleNavClick(e, '#services')}>Services</a>
          <a href="#works" onClick={(e) => handleNavClick(e, '#works')}>Works</a>
          <a href="#about" onClick={(e) => handleNavClick(e, '#about')}>Atelier</a>
          <a href="#process" onClick={(e) => handleNavClick(e, '#process')}>Process</a>
          <a href="#light-study" onClick={(e) => handleNavClick(e, '#light-study')}>Light Study</a>
          <a href="#awards" onClick={(e) => handleNavClick(e, '#awards')}>Awards</a>
          <a href="#contact" onClick={(e) => handleNavClick(e, '#contact')}>Contact</a>
        </div>
      </nav>

      <div id="fullscreen-menu" className={`fullscreen-menu ${menuOpen ? 'is-open' : ''}`} aria-hidden={!menuOpen} role="dialog" aria-label="Mobile Navigation Menu">
        <div className="fullscreen-links" role="menu">
          <a href="#services" role="menuitem" onClick={(e) => { setMenuOpen(false); handleNavClick(e, '#services'); }}>Services</a>
          <a href="#works" role="menuitem" onClick={(e) => { setMenuOpen(false); handleNavClick(e, '#works'); }}>Works</a>
          <a href="#about" role="menuitem" onClick={(e) => { setMenuOpen(false); handleNavClick(e, '#about'); }}>Atelier</a>
          <a href="#process" role="menuitem" onClick={(e) => { setMenuOpen(false); handleNavClick(e, '#process'); }}>Process</a>
          <a href="#light-study" role="menuitem" onClick={(e) => { setMenuOpen(false); handleNavClick(e, '#light-study'); }}>Light Study</a>
          <a href="#awards" role="menuitem" onClick={(e) => { setMenuOpen(false); handleNavClick(e, '#awards'); }}>Awards</a>
          <a href="#contact" role="menuitem" onClick={(e) => { setMenuOpen(false); handleNavClick(e, '#contact'); }}>Contact</a>
        </div>
      </div>
    </>
  );
}
