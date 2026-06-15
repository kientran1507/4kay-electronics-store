"use client";

import { useEffect, useRef } from "react";
import { KioskState } from "@/types";

const stateColors: Record<KioskState, number> = {
  idle: 0x1f2937,
  greeting: 0x2563eb,
  listening: 0x0ea5e9,
  thinking: 0xf59e0b,
  talking: 0x16a34a,
  presenting: 0x7c3aed,
  comparing: 0xdb2777,
  checkout: 0x059669,
  error: 0xdc2626,
};

const KioskAvatar = ({ state }: { state: KioskState }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const stateRef = useRef(state);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    let disposed = false;
    let frameId = 0;
    let cleanup = () => {};

    const setup = async () => {
      const THREE = await import("three");
      if (!canvasRef.current || disposed) return;

      const canvas = canvasRef.current;
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
      camera.position.set(0, 1.4, 7);

      const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

      const group = new THREE.Group();
      scene.add(group);

      const kioskMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.32, metalness: 0.15 });
      const accentMat = new THREE.MeshStandardMaterial({
        color: stateColors.idle,
        emissive: stateColors.idle,
        emissiveIntensity: 0.3,
      });
      const darkMat = new THREE.MeshStandardMaterial({ color: 0x111827 });

      // Placeholder kiosk assistant. Replace this group with a GLB/GLTF model via GLTFLoader later.
      // Keep stateRef animation hooks so imported models can map animation clips to kiosk states.
      const base = new THREE.Mesh(new THREE.CylinderGeometry(1.25, 1.45, 0.55, 48), kioskMat);
      base.position.y = -1.25;
      group.add(base);

      const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.82, 1.4, 12, 32), kioskMat);
      body.position.y = -0.15;
      group.add(body);

      const screen = new THREE.Mesh(new THREE.BoxGeometry(1.25, 0.72, 0.08), accentMat);
      screen.position.set(0, -0.1, 0.84);
      group.add(screen);

      const head = new THREE.Mesh(new THREE.SphereGeometry(0.58, 48, 48), kioskMat);
      head.position.y = 1.1;
      group.add(head);

      const leftEye = new THREE.Mesh(new THREE.SphereGeometry(0.06, 16, 16), darkMat);
      leftEye.position.set(-0.2, 1.18, 0.52);
      group.add(leftEye);

      const rightEye = leftEye.clone();
      rightEye.position.x = 0.2;
      group.add(rightEye);

      const halo = new THREE.Mesh(new THREE.TorusGeometry(0.82, 0.025, 12, 96), accentMat);
      halo.position.y = 1.12;
      group.add(halo);

      const shelf = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.12, 1.15), darkMat);
      shelf.position.set(0, -1.65, 0.15);
      group.add(shelf);

      scene.add(new THREE.AmbientLight(0xffffff, 1.3));
      const key = new THREE.DirectionalLight(0xffffff, 2.2);
      key.position.set(3, 5, 5);
      scene.add(key);

      const resize = () => {
        const rect = canvas.getBoundingClientRect();
        const width = Math.max(1, rect.width);
        const height = Math.max(1, rect.height);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height, false);
      };

      const observer = new ResizeObserver(resize);
      observer.observe(canvas);
      resize();

      const animate = (time: number) => {
        const current = stateRef.current;
        const seconds = time / 1000;
        const color = stateColors[current];
        accentMat.color.setHex(color);
        accentMat.emissive.setHex(color);

        group.rotation.y = Math.sin(seconds * 0.65) * 0.18;
        group.position.y = Math.sin(seconds * 1.1) * 0.04;
        halo.rotation.z += current === "thinking" ? 0.07 : 0.025;
        screen.scale.x = current === "talking" ? 1 + Math.sin(seconds * 8) * 0.04 : 1;
        body.scale.y = current === "presenting" ? 1.03 : 1;
        group.rotation.z = current === "error" ? Math.sin(seconds * 8) * 0.025 : 0;

        renderer.render(scene, camera);
        frameId = requestAnimationFrame(animate);
      };

      frameId = requestAnimationFrame(animate);

      cleanup = () => {
        cancelAnimationFrame(frameId);
        observer.disconnect();
        renderer.dispose();
        [base, body, screen, head, leftEye, halo, shelf].forEach((mesh) => mesh.geometry.dispose());
        kioskMat.dispose();
        accentMat.dispose();
        darkMat.dispose();
      };
    };

    setup();
    return () => {
      disposed = true;
      cleanup();
    };
  }, []);

  return <canvas ref={canvasRef} className="h-full min-h-[360px] w-full" aria-label={`Kiosk assistant state: ${state}`} />;
};

export default KioskAvatar;
