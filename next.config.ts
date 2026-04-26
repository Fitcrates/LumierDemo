import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Wymuszenie agresywniejszej kompresji obrazków (AVIF jest lżejszy i lepszy jakościowo od WebP)
  images: {
    formats: ['image/avif', 'image/webp'],
  },

  // Zapewnia pełną kompatybilność i optymalizację tree-shakingu dla specyficznych bibliotek
  transpilePackages: ['three', '@react-three/fiber', '@react-three/drei', 'gsap'],

  // Optymalizacje kompilatora SWC
  compiler: {
    // Automatycznie usuwa zbędne console.log() z kodu na produkcji (przyspiesza wykonanie kodu)
    removeConsole: process.env.NODE_ENV === "production" ? { exclude: ["error"] } : false,
  },
};

export default nextConfig;
