"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function Nav() {
  const navRef = useRef<HTMLElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [visible, setVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const visibleRef = useRef(false);

  useEffect(() => {
    const handleResizeState = () => setIsMobile(window.innerWidth <= 768);
    handleResizeState();
    window.addEventListener('resize', handleResizeState, { passive: true });

    if (bgRef.current) {
      const mobileCheck = window.innerWidth <= 768;
      const smallMobileCheck = window.innerWidth <= 480;
      let circleSize = 80;
      let circleTop = 2;
      let circleRight = 18;
      
      if (smallMobileCheck) {
        circleSize = 50;
        circleTop = 0;
        circleRight = 3;
      } else if (mobileCheck) {
        circleSize = 60;
        circleTop = 0;
        circleRight = 4;
      }

      gsap.set(bgRef.current, {
        width: circleSize,
        height: circleSize,
        top: circleTop,
        right: circleRight,
        borderRadius: "50%",
        clipPath: "none",
      });
    }
    // Theme detection with ScrollTrigger to avoid layout thrashing
    const sections = document.querySelectorAll('[data-nav-theme]');
    const triggers: ScrollTrigger[] = [];
    
    sections.forEach(sec => {
      const trigger = ScrollTrigger.create({
        trigger: sec,
        start: "top 100px",
        end: "bottom 100px",
        onEnter: () => setTheme(sec.getAttribute('data-nav-theme') as "dark" | "light"),
        onEnterBack: () => setTheme(sec.getAttribute('data-nav-theme') as "dark" | "light"),
      });
      triggers.push(trigger);
    });

    const updateNavBg = (shouldBeVisible: boolean) => {
      if (!bgRef.current) return;
      const mobileCheck = window.innerWidth <= 768;
      const smallMobileCheck = window.innerWidth <= 480;
      let circleSize = 80;
      let circleTop = 2;
      let circleRight = 18;
      
      if (smallMobileCheck) {
        circleSize = 50;
        circleTop = 0;
        circleRight = 3;
      } else if (mobileCheck) {
        circleSize = 60;
        circleTop = 0;
        circleRight = 4;
      }

      if (shouldBeVisible && !mobileCheck) {
        gsap.to(bgRef.current, {
          width: "100vw",
          height: 90,
          top: 0,
          right: 0,
          borderRadius: "0%",
          clipPath: "none",
          duration: 0.7,
          ease: "power4.inOut",
          overwrite: true,
        });
      } else {
        gsap.to(bgRef.current, {
          width: circleSize,
          height: circleSize,
          top: circleTop,
          right: circleRight,
          borderRadius: "50%",
          clipPath: "none",
          duration: 0.7,
          ease: "power4.inOut",
          overwrite: true,
        });
      }
    };

    const scrollListener = () => {
      const scrollY = window.scrollY;
      const shouldBeVisible = scrollY > window.innerHeight * 0.8;
      
      if (shouldBeVisible !== visibleRef.current) {
        visibleRef.current = shouldBeVisible;
        setVisible(shouldBeVisible);
        updateNavBg(shouldBeVisible);
      }
    };

    const resizeListener = () => {
      updateNavBg(visibleRef.current);
    };

    window.addEventListener("scroll", scrollListener, { passive: true });
    window.addEventListener("resize", resizeListener, { passive: true });
    
    return () => {
      window.removeEventListener('resize', handleResizeState);
      window.removeEventListener("scroll", scrollListener);
      window.removeEventListener("resize", resizeListener);
      triggers.forEach(t => t.kill());
    };
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
        className={`nav-hamburger ${visible && !isMobile ? 'hidden' : ''} ${menuOpen ? 'is-open' : ''} theme-${theme} ${visible ? 'is-scrolled' : ''}`} 
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label={menuOpen ? "Close menu" : "Open menu"}
        aria-expanded={menuOpen}
        aria-controls="fullscreen-menu"
      >
        <span></span>
        <span></span>
      </button>

      <nav ref={navRef} className={`main-nav ${visible && !isMobile ? 'nav-scrolled theme-' + theme : 'nav-top theme-' + theme}`} aria-label="Main Navigation">
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
