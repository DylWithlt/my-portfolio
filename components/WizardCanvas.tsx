"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader, type GLTF } from "three/examples/jsm/loaders/GLTFLoader";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { makeNoise3D } from "fast-simplex-noise";

export default function WizardCanvas() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    // Scene setup
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0a0a2a, 0.02);

    const camera = new THREE.PerspectiveCamera(
      45,
      mount.clientWidth / mount.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 1, -6);

    // Lighting
    const ambient = new THREE.HemisphereLight(0x6060ff, 0x404040, 0.8);
    scene.add(ambient);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(5, 10, 7);
    dirLight.castShadow = true;
    scene.add(dirLight);

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    // Load wizard model
    const loader = new GLTFLoader();
    loader.load(
      "/wizard.glb",
      (gltf: GLTF) => {
        const wizard: THREE.Scene = gltf.scene;
        wizard.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });

        const box = new THREE.Box3().setFromObject(wizard);
        const center = box.getCenter(new THREE.Vector3());
        wizard.position.sub(center);
        // wizard.position.y -= box.getSize(new THREE.Vector3()).y * 0.4; // Adjust base position

        scene.add(wizard);
      },
      undefined,
      (errorEvent: ErrorEvent) => {
        console.error("Error loading wizard.glb:", errorEvent.message);
      }
    );

    // Particle system
    const particleSystem = createMagicParticleSystem(scene, 500, camera);
    const { animate, cleanup } = particleSystem;

    // Animation loop
    const clock = new THREE.Clock();
    const animateLoop = () => {
      requestAnimationFrame(animateLoop);
      const delta = clock.getDelta();
      controls.update();
      animate(delta);
      renderer.render(scene, camera);
    };
    animateLoop();

    // Resize handling
    const handleResize = () => {
      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mount.clientWidth, mount.clientHeight);
    };
    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => {
      cleanup();
      controls.dispose();
      window.removeEventListener("resize", handleResize);
      renderer.dispose();
      while (mount.firstChild) {
        mount.removeChild(mount.firstChild);
      }
    };
  }, []);

  return <div ref={mountRef} className="fixed inset-0" />;
}

function createMagicParticleSystem(
  scene: THREE.Scene,
  particleCount: number,
  camera: THREE.PerspectiveCamera
) {
  // Geometry setup
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);
  const sizes = new Float32Array(particleCount);
  const phases = new Float32Array(particleCount);

  // Color palette for magical effect
  const colorPalette = [
    new THREE.Color(0x4d79ff), // Blue
    new THREE.Color(0x8a2be2), // Purple
    new THREE.Color(0x00ffff), // Cyan
    new THREE.Color(0xadff2f), // Green-yellow
  ];

  // Create smoother noise generator
  const noise3D = makeNoise3D();
  const noiseOffsets = new Float32Array(particleCount * 3);
  const noiseScales = new Float32Array(particleCount);

  // Initialize noise parameters
  for (let i = 0; i < particleCount; i++) {
    const i3 = i * 3;

    // Unique noise offsets for each particle
    noiseOffsets[i3] = Math.random() * 100;
    noiseOffsets[i3 + 1] = Math.random() * 100;
    noiseOffsets[i3 + 2] = Math.random() * 100;

    // Individual noise scale
    noiseScales[i] = 0.1 + Math.random() * 0.3;
  }

  // Initialize particles
  for (let i = 0; i < particleCount; i++) {
    const i3 = i * 3;

    // Spherical distribution
    const radius = 5 + Math.random() * 3;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);

    positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
    positions[i3 + 1] = radius * Math.cos(phi);
    positions[i3 + 2] = radius * Math.sin(phi) * Math.sin(theta);

    // Random color from palette
    const color = colorPalette[Math.floor(Math.random() * colorPalette.length)];
    colors[i3] = color.r;
    colors[i3 + 1] = color.g;
    colors[i3 + 2] = color.b;

    sizes[i] = 0.05 + Math.random() * 0.1;
    phases[i] = Math.random() * Math.PI * 2;
  }

  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  geometry.setAttribute("size", new THREE.BufferAttribute(sizes, 1));
  geometry.setAttribute("phase", new THREE.BufferAttribute(phases, 1));

  // Material setup
  const textureLoader = new THREE.TextureLoader();
  const sprite = textureLoader.load("/glow.png");
  const material = new THREE.PointsMaterial({
    vertexColors: true,
    size: 1,
    sizeAttenuation: true,
    map: sprite,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  const particles = new THREE.Points(geometry, material);
  scene.add(particles);

  // Animation state
  let time = 0;
  const tempVector = new THREE.Vector3();

  // Mouse interaction
  const mouse = new THREE.Vector2(0, 0);
  const mouseForce = new THREE.Vector3(0, 0, 0);
  window.addEventListener("mousemove", (event) => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  });

  const animate = (delta: number) => {
    time += delta;
    const positions = geometry.attributes.position.array as Float32Array;
    const phases = geometry.attributes.phase.array as Float32Array;

    // Calculate mouse force
    mouseForce.set(mouse.x * 2, mouse.y * 2, 0).multiplyScalar(0.3);

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      const phase = phases[i];

      // Base position with noise-based movement
      tempVector.fromArray(positions, i3);

      // Orbit around origin with individual phase
      const orbitRadius = 3 + Math.sin(time * 0.5) * 0.3;
      const angle = time * 0.8 + phase;

      // Apply smooth noise-based Y offset
      const noiseOffsetX = noiseOffsets[i3];
      const noiseOffsetZ = noiseOffsets[i3 + 2];
      const noiseScale = noiseScales[i];

      // Sample 3D noise at different frequencies
      const noiseLowFreq = noise3D(
        tempVector.x * 0.05 + noiseOffsetX,
        tempVector.z * 0.05 + noiseOffsetZ,
        time * 0.5
      );

      const noiseMidFreq = noise3D(
        tempVector.x * 0.2 + noiseOffsetX,
        tempVector.z * 0.2 + noiseOffsetZ,
        time * 0.5
      );

      const noiseValue = noiseLowFreq * 0.7 + noiseMidFreq * 0.3;
      const yOffset = noiseValue * noiseScale;

      const frustumWidth =
        2 *
        Math.tan((THREE.MathUtils.DEG2RAD * camera.fov) / 2) *
        6 *
        camera.aspect;

      const targetPos = new THREE.Vector3(
        (Math.cos(angle) * frustumWidth) / 2,
        Math.sin(time * 1.2 + phase) + yOffset * 5,
        Math.sin(angle) * orbitRadius
      );

      // Add mouse interaction
      // targetPos.add(mouseForce);

      // Smooth movement toward target
      tempVector.lerp(targetPos, 0.05);

      // Pulsating size effect
      const sizeAttr = geometry.attributes.size;
      sizeAttr.array[i] = 0.07 + Math.sin(time * 2 + phase) * 0.03;

      // Update position
      tempVector.toArray(positions, i3);
    }

    // Mark attributes as needing update
    geometry.attributes.position.needsUpdate = true;
    geometry.attributes.size.needsUpdate = true;
  };

  // const resizeHandler = () => {
  //   /* Handled in main component */
  // };

  const cleanup = () => {
    scene.remove(particles);
    material.dispose();
    geometry.dispose();
    sprite.dispose();
  };

  return { animate, cleanup };
}
