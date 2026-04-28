"use client";

import { useEffect, useRef, useMemo, useState } from "react";
import { Canvas, useThree, useFrame } from "@react-three/fiber";
import { useGLTF, Environment, Image as DreiImage, useTexture } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette, Noise } from "@react-three/postprocessing";
import * as THREE from "three";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

function Scene({ isMobile, isVisible }: { isMobile: boolean; isVisible: boolean }) {
  const { scene } = useGLTF("/model/bulbs.glb");
  // Use heroDesktop.webp for desktop, hero-bg-industrial.webp for mobile
  const bgImage = isMobile ? "/images/hero-bg-industrial.webp" : "/images/heroDesktop.webp";
  const envMap = useTexture(bgImage);
  // Ustawiamy teksturę jako mapę środowiskową (do odbić na szkle)
  envMap.mapping = THREE.EquirectangularReflectionMapping;

  const groupRef = useRef<THREE.Group>(null);
  const pointLightRef = useRef<THREE.PointLight>(null);
  const overlayMatRef = useRef<THREE.MeshBasicMaterial>(null);
  const { camera, size, gl } = useThree();
  const scale = size.width < 768 ? 0.45 : 1;
  
  // CRITICAL FIX: Pause rendering when Hero section is off-screen
  useFrame(() => {
    if (!isVisible) {
      // Stop rendering by not updating anything
      return;
    }
    // When visible, normal rendering continues automatically
  });

  // Obliczenie absolutnych, statycznych wymiarów dla płaszczyzny tła
  // Ratuje to przed glitchem skalowania, gdy kamera zmienia pozycję Z
  const { bgWidth, bgHeight } = useMemo(() => {
    const distance = 35; // Różnica Z: kamera startuje na 10, tło na -25
    const vFov = (42 * Math.PI) / 180;
    const planeHeight = 2 * Math.tan(vFov / 2) * distance;
    const planeWidth = planeHeight * (size.width / size.height);
    return {
      bgWidth: planeWidth * 1.2,  // 20% marginesu na efekty
      bgHeight: planeHeight * 1.2,
    };
  }, [size.width, size.height]);

  useEffect(() => {
    // Initial camera angle - Looking straight on at the cluster
    camera.position.set(0, 0, 10);
    camera.lookAt(0, 0, 0);

    // Traverse scene to setup materials
    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        const name = mesh.name.toLowerCase();
        const mat = mesh.material as THREE.Material;
        const matName = mat.name ? mat.name.toLowerCase() : '';

        // Compute smooth normals to reduce jagged geometry edges
        if (mesh.geometry && !mesh.geometry.attributes.normal) {
          mesh.geometry.computeVertexNormals();
        }

        const isFilament = name.includes('filament') || matName.includes('filament') || name.includes('light') || name.includes('glow');
        // Bezpieczne łapanie szkła: omijamy kable, oprawki (base, cap, metal, cord)
        const isGlass = name.includes('glass') || matName.includes('glass') || mat.transparent ||
          (name.includes('bulb') && !name.includes('cable') && !name.includes('metal') && !name.includes('holder') && !name.includes('cord') && !name.includes('cap') && !name.includes('base') && !name.includes('wire'));

        if (isFilament) {
          mesh.material = new THREE.MeshStandardMaterial({
            color: 0xffaa55,
            emissive: 0xff8833,
            emissiveIntensity: 4.0, // Startujemy od 20% mocy (około 4.0 przy max 15.0)
            toneMapped: false
          });
        }
        else if (isGlass) {
          mesh.material = new THREE.MeshPhysicalMaterial({
            color: 0xffffff,
            /* --- INSTRUKCJA TUNINGU SZKŁA ---
             * 1. roughness: 0 = idealnie gładkie szkło.
             * 2. metalness: MUSI być 0.
             * 3. envMapIntensity: Siła odbicia środowiska w szkle.
             * 4. ior: Fresnel reflections — wyższy = mocniejsze krawędziowe odbicia.
             * 5. specularIntensity: Siła lustrzanych odblasków.
             * 6. clearcoat: Subtelna warstwa lakieru na krawędziach.
             */
            roughness: 0.0,
            metalness: 0.0,
            transmission: 1,
            thickness: 0.0,
            ior: 1.65,
            transparent: true,
            opacity: 1,
            depthWrite: false,
            envMapIntensity: 1.5, // Delikatne odbicia env mapy — bez białego nałożenia
            specularIntensity: 1.2, // Subtelne odblaski Fresnela (krawędzie)
            clearcoat: 0.1, // Lekki lakier łapiący światło na krawędziach
            clearcoatRoughness: 0.05,
            side: THREE.FrontSide
          });
        }
        else {
          // Holder & Cable
          mesh.material = new THREE.MeshStandardMaterial({
            color: 0x000000, // Czysta czerń
            roughness: 0.3,
            metalness: 0.9,
            envMapIntensity: 0.95 // Kable ignorują HDR, dzięki czemu nie są szare/białe
          });
        }
      }
    });

    const emissiveMaterials: THREE.MeshStandardMaterial[] = [];
    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mat = (child as THREE.Mesh).material as THREE.MeshStandardMaterial;
        // We assigned new materials, so we check if it has emissive property
        if (mat && mat.emissive && mat.emissive.getHex() > 0) {
          emissiveMaterials.push(mat);
        }
      }
    });

    const st = ScrollTrigger.create({
      trigger: ".hero-wrapper",
      start: "top top",
      end: "bottom bottom",
      scrub: 1.2,
      onUpdate: (self) => {
        const progress = self.progress;
        // Płynny najazd ze startowego dystansu (Z=10) w środek żarówek (Z=4)
        const camZ = 10 - (progress * 6);
        // Kamera zostaje na stałej wysokości (Z=0), jedzie idealnie na wprost
        const camY = 0;
        const lightIntensity = 0.5 + (progress * 5.5); // Zaczynamy od 0.5, max 6.0
        const emissiveIntensity = 4.0 + (progress * 26.0); // Zaczynamy od 4.0, max to 30.0 (potężne żarzenie)

        if (camera) {
          camera.position.set(0, camY, camZ);
          // Kamera patrzy idealnie na wprost
          camera.lookAt(0, 0, 0);
        }
        if (pointLightRef.current) {
          pointLightRef.current.intensity = lightIntensity;
        }
        emissiveMaterials.forEach(m => {
          m.emissiveIntensity = emissiveIntensity;
        });
        if (overlayMatRef.current) {
          // Opacity spada z 0.95 do 0.15 w miarę scrollowania (odsłania tło)
          overlayMatRef.current.opacity = 0.95 - (progress * 0.8);
        }
      }
    });

    return () => {
      st.kill();
    };
  }, [scene, camera]);

  return (
    <>
      <ambientLight color="#ffffff" intensity={isMobile ? 0.08 : 0.015} />
      {/* Bardzo delikatne oświetlenie krawędziowe (Rim light), by tylko zarysować kable w ciemności */}
      <directionalLight position={[0, -10, -5]} color="#ffffff" intensity={isMobile ? 0.3 : 0.15} />
      <directionalLight position={[5, 10, 5]} color="#ffffff" intensity={isMobile ? 0.15 : 0.05} />

      {/* Dedykowany backlight — oświetla krawędzie szkła od tyłu, tworząc rim highlights */}
      <directionalLight position={[-3, 2, -8]} color="#FFDDB0" intensity={isMobile ? 0.8 : 0.4} />
      <directionalLight position={[3, -1, -6]} color="#E8D0A8" intensity={isMobile ? 0.5 : 0.25} />

      <pointLight ref={pointLightRef} position={[0, 0, 0]} color="#FFDDB0" intensity={isMobile ? 1.5 : 0.5} distance={30} decay={1.5} />

      {/* Używamy obrazu tła jako mapy odbić, dzięki czemu szkło odbija nasze dedykowane wnętrze */}
      {/* background={false} - ważne! Bez tego Environment renderuje własne tło (łuna w rogu na mobile) */}
      <Environment map={envMap} background={false} />

      {/* 
        =========================================================
        [ TŁO I OVERLAY ] Wewnątrz Three.js, aby szkło mogło je załamywać
        =========================================================
      */}
      <group position={[0, 0, -25]}>
        <DreiImage url={bgImage} scale={[bgWidth, bgHeight]} transparent={false} />
        {/* Warstwa przyciemniająca tło */}
        <mesh position={[0, 0, 0.1]}>
          <planeGeometry args={[bgWidth, bgHeight]} />
          <meshBasicMaterial ref={overlayMatRef} color="#080709" transparent opacity={0.95} depthWrite={false} />
        </mesh>
      </group>

      <group ref={groupRef} position={[0, -1, 1.2]} scale={[scale, scale, scale]}>
        <primitive object={scene} />
      </group>
    </>
  );
}

export default function ThreeScene() {
  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;
  const [isVisible, setIsVisible] = useState(true);
  const canvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // CRITICAL FIX: Stop Three.js rendering when Hero section is off-screen
    const heroSection = document.querySelector('.hero-wrapper');
    if (!heroSection) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
        // Additional optimization: reduce frame rate when barely visible
        if (entry.intersectionRatio < 0.1) {
          setIsVisible(false);
        }
      },
      { threshold: [0, 0.1] } // Trigger at 0% and 10% visibility
    );

    observer.observe(heroSection);

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={canvasRef} style={{ width: '100%', height: '100%' }}>
      <Canvas 
        camera={{ fov: 42, position: [0, 0, 10] }} 
        gl={{ antialias: !isMobile, alpha: true, powerPreference: "high-performance" }}
        dpr={[1, isMobile ? 1 : 1.5]}
        frameloop={isVisible ? "always" : "never"} // CRITICAL: Stop RAF when not visible
      >
        <color attach="background" args={['#080709']} />
        <Scene isMobile={isMobile} isVisible={isVisible} />
        {!isMobile ? (
          <EffectComposer>
            <Bloom luminanceThreshold={0.4} luminanceSmoothing={0.3} mipmapBlur intensity={2.8} radius={0.85} />
            <Noise opacity={0.04} />
            <Vignette offset={0.3} darkness={0.85} />
          </EffectComposer>
        ) : (
          // Na mobile: mniejszy Bloom (wydajność) + Noise + Vignette żeby nie było tak ciemno
          <EffectComposer>
            <Bloom luminanceThreshold={0.6} luminanceSmoothing={0.4} mipmapBlur intensity={1.2} radius={0.7} />
            <Noise opacity={0.06} />
            <Vignette offset={0.25} darkness={0.7} />
          </EffectComposer>
        )}
      </Canvas>
    </div>
  );
}
