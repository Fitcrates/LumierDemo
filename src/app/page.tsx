import dynamic from 'next/dynamic';
import Hero from "@/components/sections/Hero";

const Statement = dynamic(() => import("@/components/sections/Statement"));
const Services = dynamic(() => import("@/components/sections/Services"));
const Works = dynamic(() => import("@/components/sections/Works"));
const Marquee = dynamic(() => import("@/components/sections/Marquee"));
const About = dynamic(() => import("@/components/sections/About"));
const Process = dynamic(() => import("@/components/sections/Process"));
const LightStudy = dynamic(() => import("@/components/sections/LightStudy"));
const Awards = dynamic(() => import("@/components/sections/Awards"));
const Contact = dynamic(() => import("@/components/sections/Contact"));
const Footer = dynamic(() => import("@/components/sections/Footer"));

export default function Home() {
  return (
    <main id="main-content" role="main">
      <Hero />
      <Statement />
      <Services />
      <Works />
      <Marquee />
      <About />
      <Process />
      <LightStudy />
      <Awards />
      <Contact />
      <Footer />
    </main>
  );
}
