"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import SplitType from "split-type";
import Image from "next/image";

gsap.registerPlugin(ScrollTrigger);

const servicesData = [
  {
    title: "Residential Design",
    desc: "Curated living spaces that reflect personal narratives and refined aesthetics.",
    image: "/images/Elegancka przestrzeń w stylu biblioteki.webp"
  },
  {
    title: "Commercial Spaces",
    desc: "Atmospheric environments for hospitality, retail, and corporate wellness.",
    image: "/images/Luksusowy, ciemny hol restauracyjny.webp"
  },
  {
    title: "Lighting Architecture",
    desc: "Sculptural lighting installations and atmospheric illumination planning.",
    image: "/images/Nowoczesny żyrandol w ciemnym pomieszczeniu.webp"
  },
  {
    title: "Art & Curation",
    desc: "Sourcing and integrating unique art pieces and custom furniture.",
    image: "/images/Elegancki kącik z abstrakcyjnym obrazem.webp"
  }
];

export default function Services() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const hoverImgContainerRef = useRef<HTMLDivElement>(null);
  const quickXRef = useRef<gsap.QuickToFunc | null>(null);
  const quickYRef = useRef<gsap.QuickToFunc | null>(null);
  const [activeImg, setActiveImg] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const mousePos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);

    const handleGlobalMouseMove = (e: MouseEvent) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener("mousemove", handleGlobalMouseMove);

    // Inicjalizacja quickTo dla płynnego śledzenia kursora (reużywalny tween)
    if (hoverImgContainerRef.current) {
      quickXRef.current = gsap.quickTo(hoverImgContainerRef.current, "x", { duration: 0.7, ease: "power3.out" });
      quickYRef.current = gsap.quickTo(hoverImgContainerRef.current, "y", { duration: 0.7, ease: "power3.out" });
    }

    // Zabezpieczenie przed "wiszącym" obrazkiem podczas szybkiego scrolla
    const handleScroll = () => {
      if (!sectionRef.current || !hoverImgContainerRef.current) return;
      const rect = sectionRef.current.getBoundingClientRect();
      const { y } = mousePos.current;
      
      // Jeśli kursor znalazł się poza sekcją na skutek scrolla, ukrywamy hover.
      if (y < rect.top || y > rect.bottom) {
        gsap.to(hoverImgContainerRef.current, { opacity: 0, scale: 0.85, duration: 0.3, ease: "power2.out" });
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });

    const mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      if (!sectionRef.current) return;
      const services = sectionRef.current.querySelectorAll(".service-row");

      services.forEach((row) => {
        const title = row.querySelector(".service-name");
        if (title) {
          const split = new SplitType(title as HTMLElement, { types: "chars" });
          if (split.chars) {
            gsap.to(split.chars, {
              scrollTrigger: {
                trigger: row,
                start: "top 85%",
              },
              y: "0%",
              duration: 0.8,
              stagger: 0.04,
              ease: "power3.out"
            });
          }
        }
      });
    });

    return () => {
      mm.revert();
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("mousemove", handleGlobalMouseMove);
      window.removeEventListener("resize", checkMobile);
    };
  }, []);

  const handleMouseEnter = (img: string, e: React.MouseEvent) => {
    if (isMobile) return; // Nie uruchamiaj hovera na mobile

    setActiveImg(img);
    if (hoverImgContainerRef.current) {
      // Natychmiastowo ustawia pozycję na kursorze, by obrazek nie przylatywał z rogu ekranu
      gsap.set(hoverImgContainerRef.current, {
        x: e.clientX,
        y: e.clientY,
        xPercent: -50,
        yPercent: -50,
      });
      // Płynne wejście
      gsap.to(hoverImgContainerRef.current, {
        opacity: 1,
        scale: 1,
        rotation: Math.random() * 4 - 2, // Delikatny, losowy kąt dodający artyzmu
        duration: 0.5,
        ease: "power3.out"
      });
    }
  };

  const handleMouseLeave = () => {
    if (isMobile) return;
    if (hoverImgContainerRef.current) {
      gsap.to(hoverImgContainerRef.current, {
        opacity: 0,
        scale: 0.85,
        duration: 0.4,
        ease: "power3.inOut"
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isMobile) return;
    // quickTo reużywa jednego tweena zamiast tworzyć nowy na każdy ruch myszy
    if (quickXRef.current) quickXRef.current(e.clientX);
    if (quickYRef.current) quickYRef.current(e.clientY);
  };

  return (
    <section className="services-section" id="services" ref={sectionRef} data-nav-theme="dark" style={{ position: "relative" }} onMouseLeave={handleMouseLeave}>
      {servicesData.map((service, idx) => (
        <div
          className="service-row"
          key={idx}
          onMouseEnter={(e) => handleMouseEnter(service.image, e)}
          onMouseLeave={handleMouseLeave}
          onMouseMove={handleMouseMove}
          tabIndex={0}
          role="button"
          aria-expanded={activeImg === service.image}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              handleMouseEnter(service.image, e as any);
            }
          }}
        >
          <h3 className="service-name cormorant-italic">{service.title}</h3>
          <div className="service-line"></div>
          <div className="service-desc">{service.desc}</div>
          <div className="service-arrow">→</div>

          {/* Mobilny layout: obrazek pojawia się pod tekstem */}
          {isMobile && (
            <div style={{
              gridColumn: "1 / -1",
              marginTop: "2rem",
              width: "100%",
              aspectRatio: "1/1",
              overflow: "hidden"
            }}>
              <Image
                src={service.image}
                alt={service.title}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                style={{
                  objectFit: "cover",
                  filter: "brightness(0.85)"
                }}
              />
            </div>
          )}
        </div>
      ))}

      {/* Kontener podążający za kursorem (tylko Desktop) */}
      {!isMobile && (
        <div
          ref={hoverImgContainerRef}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "clamp(350px, 30vw, 550px)", // Dużo większy obrazek
            aspectRatio: "1/1", // Utrzymuje kwadratowe proporcje oryginalnych obrazków
            pointerEvents: "none",
            opacity: 0,
            scale: 0.85,
            zIndex: 50,
            overflow: "hidden",
            border: "2px solid rgba(191, 140, 58, 0.12)",
            boxShadow: "0 20px 40px rgba(0,0,0,0.5)" // Dodaje kinowej głębi
          }}
        >
          {activeImg && (
            <Image
              src={activeImg}
              alt="Service preview"
              fill
              sizes="33vw"
              style={{ objectFit: "cover" }}
            />
          )}
        </div>
      )}
    </section>
  );
}
