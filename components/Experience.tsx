
import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { HandData, GestureType } from '../types';
import { COLORS } from '../constants';

interface Props {
  hands: HandData[];
  swordCount: number;
}

const Experience: React.FC<Props> = ({ hands, swordCount }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const instancedMeshRef = useRef<THREE.InstancedMesh | null>(null);
  
  // Sword state persistence
  const swordDataRef = useRef<{
    position: THREE.Vector3[];
    velocity: THREE.Vector3[];
    targetPos: THREE.Vector3[];
  }>({
    position: [],
    velocity: [],
    targetPos: []
  });

  useEffect(() => {
    if (!containerRef.current) return;

    // Initialization
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.fog = new THREE.FogExp2(0x000814, 0.05);

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 15;
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);
    const pointLight = new THREE.PointLight(0x00f0ff, 20, 100);
    pointLight.position.set(0, 5, 5);
    scene.add(pointLight);

    // Sword Geometry (Procedural Jian)
    const swordGeo = new THREE.BufferGeometry();
    const vertices = new Float32Array([
       0, 1.5, 0,  -0.1, 0, 0,   0.1, 0, 0,    // blade tip
      -0.1, 0, 0,   0.1, 0, 0,  -0.1, -1.2, 0, // blade body
       0.1, 0, 0,   0.1, -1.2, 0, -0.1, -1.2, 0, // blade body
      -0.2, -1.2, 0, 0.2, -1.2, 0, 0, -1.3, 0, // crossguard
       0, -1.3, 0, -0.05, -1.7, 0, 0.05, -1.7, 0 // hilt
    ]);
    swordGeo.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    
    const swordMat = new THREE.MeshStandardMaterial({
      color: COLORS.SWORD_CORE,
      emissive: COLORS.SWORD_GLOW,
      emissiveIntensity: 1.5,
      side: THREE.DoubleSide
    });

    const instancedMesh = new THREE.InstancedMesh(swordGeo, swordMat, swordCount);
    scene.add(instancedMesh);
    instancedMeshRef.current = instancedMesh;

    // Initial Sword data
    for (let i = 0; i < swordCount; i++) {
      const pos = new THREE.Vector3(
        (Math.random() - 0.5) * 50,
        (Math.random() - 0.5) * 50,
        (Math.random() - 0.5) * 30
      );
      swordDataRef.current.position.push(pos);
      swordDataRef.current.targetPos.push(pos.clone());
      swordDataRef.current.velocity.push(new THREE.Vector3());
    }

    // Stars background
    const starGeo = new THREE.BufferGeometry();
    const starCount = 3000;
    const starPos = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      starPos[i*3] = (Math.random() - 0.5) * 150;
      starPos[i*3+1] = (Math.random() - 0.5) * 150;
      starPos[i*3+2] = (Math.random() - 0.5) * 150;
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    const starMat = new THREE.PointsMaterial({ color: 0x55aaff, size: 0.08, transparent: true, opacity: 0.6 });
    const stars = new THREE.Points(starGeo, starMat);
    scene.add(stars);

    // Animation Loop
    let time = 0;
    const dummy = new THREE.Object3D();

    const animate = () => {
      requestAnimationFrame(animate);
      time += 0.016; // approx 60fps delta

      // Update light position if hands exist
      if (hands.length > 0) {
        const hand = hands[0];
        pointLight.position.set(
          (hand.palmCenter.x - 0.5) * 35,
          -(hand.palmCenter.y - 0.5) * 25,
          8
        );
      }

      // Physics and Logic
      for (let i = 0; i < swordCount; i++) {
        const currentPos = swordDataRef.current.position[i];
        const targetPos = swordDataRef.current.targetPos[i];
        const vel = swordDataRef.current.velocity[i];

        // Default: Idle behavior
        if (hands.length === 0) {
          const angle = (i / swordCount) * Math.PI * 2 + time * 0.3;
          const radius = 12 + Math.sin(time * 0.5 + i * 0.05) * 3;
          targetPos.set(
            Math.cos(angle) * radius,
            Math.sin(angle * 0.8) * radius * 0.7,
            Math.sin(time * 0.2 + i * 0.02) * 8
          );
        } else {
          const hand1 = hands[0];
          const h1Pos = new THREE.Vector3((hand1.palmCenter.x - 0.5) * 40, -(hand1.palmCenter.y - 0.5) * 30, 0);

          if (hand1.gesture === GestureType.FIST) {
            const hand2 = hands[1];
            if (hand2 && hand2.gesture === GestureType.FIST) {
                // Mega convergence
                targetPos.copy(h1Pos).add(new THREE.Vector3((Math.random()-0.5)*2, (Math.random()-0.5)*2, 0));
            } else {
                // Beam attack forward
                const noise = Math.sin(time * 15 + i) * 0.8;
                targetPos.set(h1Pos.x + noise, h1Pos.y + noise, h1Pos.z - 10 - (i % 20));
            }
          } else if (hand1.gesture === GestureType.OPEN_PALM) {
            // Defensive Circle
            const angle = (i / swordCount) * Math.PI * 2 + time;
            const radius = 10;
            targetPos.set(
              h1Pos.x + Math.cos(angle) * radius,
              h1Pos.y + Math.sin(angle) * radius,
              h1Pos.z + Math.cos(angle * 2) * 2
            );
          } else if (hand1.gesture === GestureType.POINTING) {
            // Pointing Focus
            const dir = new THREE.Vector3(hand1.direction.x, hand1.direction.y, hand1.direction.z).normalize();
            const spread = (i % 10) * 0.1;
            targetPos.copy(h1Pos).add(dir.clone().multiplyScalar(5 + (i/swordCount) * 25));
            targetPos.x += (Math.random()-0.5) * spread;
            targetPos.y += (Math.random()-0.5) * spread;
          } else {
            // Relaxed orbit
            const angle = (i / swordCount) * Math.PI * 2 + time * 0.5;
            const radius = 6 + Math.sin(time + i * 0.1) * 2;
            targetPos.set(
                h1Pos.x + Math.cos(angle) * radius,
                h1Pos.y + Math.sin(angle) * radius,
                h1Pos.z + Math.cos(time + i) * 3
            );
          }
        }

        // Spring movement
        const force = targetPos.clone().sub(currentPos).multiplyScalar(0.06);
        vel.add(force).multiplyScalar(0.85);
        currentPos.add(vel);

        // Orientation
        dummy.position.copy(currentPos);
        const lookTarget = currentPos.clone().add(vel.length() > 0.05 ? vel : new THREE.Vector3(0, 1, 0));
        dummy.lookAt(lookTarget);
        dummy.rotateX(Math.PI / 2);
        dummy.updateMatrix();
        instancedMesh.setMatrixAt(i, dummy.matrix);
      }

      instancedMesh.instanceMatrix.needsUpdate = true;
      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!cameraRef.current || !rendererRef.current) return;
      cameraRef.current.aspect = window.innerWidth / window.innerHeight;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      scene.clear();
    };
  }, [swordCount]);

  return <div ref={containerRef} className="absolute inset-0 z-0" />;
};

export default Experience;
