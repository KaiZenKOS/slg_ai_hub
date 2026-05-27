import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useChatStore } from '../stores/chatStore';

interface ParticleCloudProps {
  count: number;
  isChatting: boolean;
}

const ParticleSphere: React.FC<ParticleCloudProps> = ({ count = 800, isChatting }) => {
  const pointsRef = useRef<THREE.Points>(null);
  const matRef = useRef<THREE.PointsMaterial>(null);

  // Generate original positions in a spherical shell structure
  const [positions, originalPositions] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const orig = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      // Uniform spherical distribution
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      
      // Radius of the sphere shell (between 2.5 and 3.0)
      const r = 2.4 + Math.random() * 0.6;
      
      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta);
      const z = r * Math.cos(phi);

      pos[i * 3] = x;
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = z;

      orig[i * 3] = x;
      orig[i * 3 + 1] = y;
      orig[i * 3 + 2] = z;
    }
    return [pos, orig];
  }, [count]);

  // Create a canvas-generated circular glowing texture dynamically
  const dotTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, 32, 32);
      const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
      gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');      // Center white
      gradient.addColorStop(0.2, 'rgba(0, 156, 222, 0.7)');    // Cyan
      gradient.addColorStop(0.6, 'rgba(30, 72, 122, 0.25)');   // Light Navy
      gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');      // Outer transparent
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 32, 32);
    }
    return new THREE.CanvasTexture(canvas);
  }, []);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (!pointsRef.current || !matRef.current) return;

    const points = pointsRef.current;
    const geo = points.geometry;
    const posAttr = geo.attributes.position;

    // 1. Interpolate scale, position, and opacity based on active chat state
    const targetScale = isChatting ? 0.55 : 1.1;
    // When chatting, move it slightly up/right to avoid overlapping text, and deeper in Z
    const targetY = isChatting ? 1.5 : -0.2;
    const targetZ = isChatting ? -3 : 0;
    const targetOpacity = isChatting ? 0.2 : 0.65;

    points.scale.setScalar(
      THREE.MathUtils.lerp(points.scale.x, targetScale, 0.04)
    );
    points.position.y = THREE.MathUtils.lerp(points.position.y, targetY, 0.04);
    points.position.z = THREE.MathUtils.lerp(points.position.z, targetZ, 0.04);
    matRef.current.opacity = THREE.MathUtils.lerp(matRef.current.opacity, targetOpacity, 0.04);

    // 2. Slow rotation of the sphere
    points.rotation.y = time * 0.04;
    points.rotation.x = time * 0.015;

    // 3. Spherical wave undulation (breathing neural net effect)
    for (let i = 0; i < count; i++) {
      const origX = originalPositions[i * 3];
      const origY = originalPositions[i * 3 + 1];
      const origZ = originalPositions[i * 3 + 2];

      const r = Math.sqrt(origX * origX + origY * origY + origZ * origZ);
      
      // Undulate the radius based on time and coordinates
      const wave = Math.sin(time * 0.7 + origX * 0.6 + origY * 0.6) * 0.12;
      const factor = (r + wave) / r;

      posAttr.setXYZ(i, origX * factor, origY * factor, origZ * factor);
    }
    posAttr.needsUpdate = true;

    // 4. Parallax mouse tracking
    const mouseX = state.pointer.x * 0.4;
    const mouseY = state.pointer.y * 0.4;
    
    // Smoothly apply mouse drift to position
    points.position.x = THREE.MathUtils.lerp(points.position.x, mouseX, 0.04);
    // Add small Y offset based on mouse
    points.position.y += (mouseY * 0.1 - points.position.y * 0.01) * 0.04;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        ref={matRef}
        size={0.16}
        map={dotTexture}
        transparent={true}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        opacity={0.65}
      />
    </points>
  );
};

export const Background3D: React.FC = () => {
  const { conversations, activeConversationId } = useChatStore();

  const activeConversation = conversations.find(
    (c) => c.id === activeConversationId
  );
  const isChatting = activeConversation ? activeConversation.messages.length > 0 : false;

  return (
    <div className="fixed inset-0 w-full h-full -z-10 overflow-hidden pointer-events-none">
      <Canvas
        camera={{ position: [0, 0, 8], fov: 55 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[1, 3, 1]} intensity={0.4} />
        <ParticleSphere count={900} isChatting={isChatting} />
      </Canvas>
    </div>
  );
};

export default Background3D;
