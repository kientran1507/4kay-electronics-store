"use client";

import { useEffect, useRef } from "react";
import { AvatarState } from "@/types";

interface Avatar3DProps {
  state: AvatarState;
}

const stateColors: Record<AvatarState, number> = {
  idle: 0x111827,
  listening: 0x2563eb,
  thinking: 0xf59e0b,
  talking: 0x16a34a,
};

const Avatar3D = ({ state }: Avatar3DProps) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const stateRef = useRef(state);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    let disposed = false;
    let frameId = 0;
    let cleanup = () => {};

    const setupScene = async () => {
      const THREE = await import("three");
      if (!canvasRef.current || disposed) return;

      const canvas = canvasRef.current;
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
      camera.position.set(0, 0.6, 6);

      const renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: true,
      });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

      const group = new THREE.Group();
      scene.add(group);

      const bodyMaterial = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        roughness: 0.35,
        metalness: 0.08,
      });
      const accentMaterial = new THREE.MeshStandardMaterial({
        color: stateColors.idle,
        emissive: stateColors.idle,
        emissiveIntensity: 0.25,
      });
      const darkMaterial = new THREE.MeshStandardMaterial({ color: 0x111827 });

      // Placeholder avatar: replace this group with a loaded GLB/GLTF model later.
      // Keep the same stateRef-driven animation hooks below for idle/listening/thinking/talking.
      const body = new THREE.Mesh(new THREE.CylinderGeometry(0.68, 0.86, 1.45, 32), bodyMaterial);
      body.position.y = -0.55;
      group.add(body);

      const chest = new THREE.Mesh(new THREE.TorusGeometry(0.46, 0.035, 12, 48), accentMaterial);
      chest.position.y = -0.15;
      chest.rotation.x = Math.PI / 2;
      group.add(chest);

      const head = new THREE.Mesh(new THREE.SphereGeometry(0.62, 48, 48), bodyMaterial);
      head.position.y = 0.58;
      group.add(head);

      const leftEye = new THREE.Mesh(new THREE.SphereGeometry(0.055, 16, 16), darkMaterial);
      leftEye.position.set(-0.2, 0.68, 0.55);
      group.add(leftEye);

      const rightEye = leftEye.clone();
      rightEye.position.x = 0.2;
      group.add(rightEye);

      const halo = new THREE.Mesh(new THREE.TorusGeometry(0.82, 0.018, 12, 80), accentMaterial);
      halo.position.y = 0.58;
      group.add(halo);

      const keyLight = new THREE.DirectionalLight(0xffffff, 2);
      keyLight.position.set(3, 4, 5);
      scene.add(keyLight);
      scene.add(new THREE.AmbientLight(0xffffff, 1.4));

      const resize = () => {
        const rect = canvas.getBoundingClientRect();
        const width = Math.max(1, rect.width);
        const height = Math.max(1, rect.height);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height, false);
      };

      const resizeObserver = new ResizeObserver(resize);
      resizeObserver.observe(canvas);
      resize();

      const animate = (time: number) => {
        const currentState = stateRef.current;
        const seconds = time / 1000;
        const color = stateColors[currentState];

        accentMaterial.color.setHex(color);
        accentMaterial.emissive.setHex(color);
        group.rotation.y = Math.sin(seconds * 0.9) * 0.18;
        group.position.y = Math.sin(seconds * 1.3) * 0.05;
        halo.rotation.z += currentState === "thinking" ? 0.055 : 0.018;

        if (currentState === "listening") {
          group.scale.setScalar(1 + Math.sin(seconds * 5) * 0.025);
        } else if (currentState === "thinking") {
          group.rotation.z = Math.sin(seconds * 4) * 0.04;
          group.scale.setScalar(1);
        } else if (currentState === "talking") {
          head.scale.y = 1 + Math.sin(seconds * 9) * 0.035;
          group.scale.setScalar(1);
        } else {
          group.rotation.z = 0;
          head.scale.y = 1;
          group.scale.setScalar(1);
        }

        renderer.render(scene, camera);
        frameId = window.requestAnimationFrame(animate);
      };

      frameId = window.requestAnimationFrame(animate);

      cleanup = () => {
        window.cancelAnimationFrame(frameId);
        resizeObserver.disconnect();
        renderer.dispose();
        body.geometry.dispose();
        head.geometry.dispose();
        chest.geometry.dispose();
        halo.geometry.dispose();
        leftEye.geometry.dispose();
        bodyMaterial.dispose();
        accentMaterial.dispose();
        darkMaterial.dispose();
      };
    };

    setupScene();

    return () => {
      disposed = true;
      cleanup();
    };
  }, []);

  return (
    <div className="h-32 w-32 overflow-hidden rounded-full bg-gradient-to-b from-gray-50 to-gray-200">
      <canvas ref={canvasRef} className="h-full w-full" aria-label={`AI avatar is ${state}`} />
    </div>
  );
};

export default Avatar3D;
