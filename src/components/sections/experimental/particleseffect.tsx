"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

class Particle {
    ox: number;
    oy: number;
    x: number;
    y: number;
    vx: number;
    vy: number;
    noiseOffset: number;

    constructor(x: number, y: number) {
        this.ox = x;
        this.oy = y;
        this.x = x;
        this.y = y;
        this.vx = 0;
        this.vy = 0;
        // Precompute a random offset for fluid swirling
        this.noiseOffset = Math.random() * Math.PI * 2;
    }
}

export default function Contact() {
    const contactRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        if (!contactRef.current || !canvasRef.current) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (!ctx) return;

        let particles: Particle[] = [];
        let animationFrameId: number;
        let mouseX = -9999;
        let mouseY = -9999;

        const onMouseMove = (e: MouseEvent) => {
            const rect = canvas.getBoundingClientRect();
            mouseX = e.clientX - rect.left;
            mouseY = e.clientY - rect.top;
        };

        const onMouseLeave = () => {
            mouseX = -9999;
            mouseY = -9999;
        };

        canvas.addEventListener('mousemove', onMouseMove);
        canvas.addEventListener('mouseleave', onMouseLeave);

        const initCanvas = () => {
            const dpr = window.devicePixelRatio || 1;
            const rect = contactRef.current!.getBoundingClientRect();

            canvas.width = rect.width * dpr;
            canvas.height = rect.height * dpr;

            const offscreen = document.createElement("canvas");
            offscreen.width = canvas.width;
            offscreen.height = canvas.height;
            const offCtx = offscreen.getContext("2d", { willReadFrequently: true });
            if (!offCtx) return;

            const fontSize = window.innerWidth > 768 ? 150 : 80;
            const scaledFontSize = fontSize * dpr;

            offCtx.font = `400 ${scaledFontSize}px Inter, sans-serif`;
            offCtx.fillStyle = "#141210";
            offCtx.textAlign = "center";
            offCtx.textBaseline = "middle";

            const textY = (rect.height / 2 - fontSize * 0.5) * dpr;
            offCtx.fillText("Let's work", canvas.width / 2, textY);
            offCtx.fillText("together.", canvas.width / 2, textY + scaledFontSize * 1.1);

            const imageData = offCtx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;
            particles = [];

            // Mikro cząsteczki: na retine bierzemy co 2 piksel (żeby nie było 500k cząsteczek), na zwykłym co 1
            const step = Math.max(1, Math.round(dpr));

            for (let y = 0; y < canvas.height; y += step) {
                for (let x = 0; x < canvas.width; x += step) {
                    const index = (y * canvas.width + x) * 4;
                    const alpha = data[index + 3];

                    if (alpha > 128) {
                        particles.push(new Particle(x, y));
                    }
                }
            }

            animate();
        };

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const dpr = window.devicePixelRatio || 1;
            const scaledMouseX = mouseX !== -9999 ? mouseX * dpr : -9999;
            const scaledMouseY = mouseY !== -9999 ? mouseY * dpr : -9999;

            const radius = 150 * dpr;
            const radiusSq = radius * radius;
            // Ustawiamy rozmiar cząsteczki tak, aby tworzyła spójny tekst bez blokowych przerw
            const size = Math.max(1, Math.round(dpr));

            ctx.fillStyle = "#141210";
            ctx.beginPath();

            for (let i = 0; i < particles.length; i++) {
                const p = particles[i];

                const dx = p.x - scaledMouseX;
                const dy = p.y - scaledMouseY;
                const distSq = dx * dx + dy * dy;

                if (distSq < radiusSq) {
                    const dist = Math.sqrt(distSq);
                    // Używamy funkcji kwadratowej dla łagodniejszego spadku siły na krawędzi pędzla
                    const force = Math.pow((radius - dist) / radius, 2);

                    // Odpychanie od środka kursora
                    const pushX = dx / dist;
                    const pushY = dy / dist;

                    // Drobne statyczne rozproszenie (noiseOffset), żeby nie tworzyło idealnego koła
                    const scatterX = Math.cos(p.noiseOffset) * 0.3;
                    const scatterY = Math.sin(p.noiseOffset) * 0.3;

                    p.vx += (pushX + scatterX) * force * 5;
                    p.vy += (pushY + scatterY) * force * 5;

                    // Delikatny podmuch wiatru w prawo (jak w Unicorn Studio)
                    p.vx += force * 2.0;
                }

                // Płynny powrót do bazy (bardzo niska sprężystość)
                p.vx += (p.ox - p.x) * 0.015;
                p.vy += (p.oy - p.y) * 0.015;

                // Silne tarcie, żeby nie było efektu "odbijającej się piłeczki"
                p.vx *= 0.88;
                p.vy *= 0.88;

                p.x += p.vx;
                p.y += p.vy;

                ctx.rect(p.x, p.y, size, size);
            }

            ctx.fill();

            animationFrameId = requestAnimationFrame(animate);
        };

        document.fonts.ready.then(() => {
            setTimeout(initCanvas, 100);
        });

        const handleResize = () => {
            cancelAnimationFrame(animationFrameId);
            initCanvas();
        };
        window.addEventListener("resize", handleResize);

        return () => {
            window.removeEventListener("resize", handleResize);
            canvas.removeEventListener('mousemove', onMouseMove);
            canvas.removeEventListener('mouseleave', onMouseLeave);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <section className="contact-section" id="contact" ref={contactRef} data-nav-theme="light" style={{ position: "relative", minHeight: "100vh", backgroundColor: "var(--parchment)", overflow: "hidden" }}>
            <canvas
                ref={canvasRef}
                style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    zIndex: 1,
                    cursor: "none"
                }}
            />

            <div style={{ zIndex: 2, position: "relative", paddingTop: "80vh", display: "flex", flexDirection: "column", alignItems: "center", pointerEvents: "none" }}>
                <a href="mailto:hello@lumiere.com" className="contact-email-wrapper" style={{ pointerEvents: "auto" }}>
                    <div className="contact-email">hello@lumiere.com</div>
                    <div className="contact-email-line"></div>
                </a>
                <div className="contact-locations">Warsaw · Vienna · Paris</div>
            </div>
        </section>
    );
}
