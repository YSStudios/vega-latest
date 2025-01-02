"use client";
import React, { useEffect, useState, useRef } from "react";
import { useSelector } from "react-redux";
import { themeValue, particleColorValue } from "../slices/themeSlice";
import * as THREE from "three";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import styles from "../styles/Particle.module.scss";
import gsap from "gsap";
import MatrixText from "./MatrixText";

const MapComponent = ({ animationSpeedRef }) => {
  const theme = useSelector(themeValue);
  const particleColor = useSelector(particleColorValue);
  const loaderActive = useSelector((state) => state.active.loaderActive);
  const introRef = useRef(null);
  const [showIntro, setShowIntro] = useState(true);
  const [clearColor, setClearColor] = useState(0x000000);
  const cornerElementsRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [particlesCreated, setParticlesCreated] = useState(false);
  const [particlesInitialized, setParticlesInitialized] = useState(false);

  const rendererRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const particlesRef = useRef(null);
  const composerRef = useRef(null);
  const colorTransitionRef = useRef(null);
  const spinCompleteRef = useRef(false);
  const isSpinningRef = useRef(false);
  const mouseRef = useRef({
    x: 0,
    y: 0,
    worldPosition: new THREE.Vector3(),
  });
  const raycasterRef = useRef(new THREE.Raycaster());

  let ww = typeof window !== "undefined" ? window.innerWidth : 800;
  let wh = typeof window !== "undefined" ? window.innerHeight : 600;

  useEffect(() => {
    setIsLoading(true);

    const loaderTimer = setTimeout(() => {
      setIsLoading(false);

      const tl = gsap.timeline();
      tl.fromTo(
        introRef.current.children,
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, stagger: 0.5, ease: "power2.out" }
      )
        .to(cornerElementsRef.current, { opacity: 1, duration: 1 }, "-=0.5")
        .to([introRef.current, cornerElementsRef.current], {
          opacity: 0,
          duration: 1,
          delay: 3,
          onComplete: () => {
            setShowIntro(false);
            if (introRef.current && cornerElementsRef.current) {
              introRef.current.style.display = "none";
              cornerElementsRef.current.style.display = "none";
            }
          },
        });
    }, 1500);

    if (!particlesCreated) {
      console.log("Initializing particles with color:", particleColor);
      init(particleColor);
      setParticlesCreated(true);
    }

    return () => clearTimeout(loaderTimer);
  }, []);

  useEffect(() => {
    if (particlesCreated) return;

    const initializeParticles = () => {
      console.log("Current theme state:", theme);
      console.log("Initializing particles with color:", particleColor);

      init(particleColor);
      setParticlesCreated(true);
    };

    const timer = setTimeout(initializeParticles, 100);

    return () => clearTimeout(timer);
  }, [theme, particleColor, particlesCreated]);

  useEffect(() => {
    if (!particlesCreated) return;

    console.log("Color transition to:", particleColor);
    if (particlesRef.current && rendererRef.current) {
      startColorTransition(particleColor);
    }
  }, [particleColor, particlesCreated]);

  useEffect(() => {
    if (!loaderActive && particlesInitialized && !spinCompleteRef.current) {
      console.log("Triggering camera spin");
      spinCamera();
    }
  }, [loaderActive, particlesInitialized]);

  useEffect(() => {
    if (!loaderActive) {
      setShowIntro(false);
    }
  }, [loaderActive]);

  const animateCamera = (stage) => {
    if (!cameraRef.current) return;

    const camera = cameraRef.current;
    console.log("Camera before animation:", {
      x: camera.position.x,
      y: camera.position.y,
      z: camera.position.z,
      fov: camera.fov,
    });

    if (stage === "initial") {
      gsap.set(camera.position, { x: 0, y: 0, z: 50 });
      gsap.to(camera.position, {
        duration: 5,
        z: 400,
        ease: "power2.out",
        onComplete: () => setParticlesInitialized(true),
      });
    }
  };

  const startColorTransition = (targetParticleColor) => {
    if (colorTransitionRef.current) {
      cancelAnimationFrame(colorTransitionRef.current);
    }

    if (
      !particlesRef.current ||
      !particlesRef.current.material ||
      !rendererRef.current
    ) {
      console.error("Required objects not initialized");
      return;
    }

    const startParticleColor = particlesRef.current.material.color.clone();
    const targetParticleColorObj = new THREE.Color(targetParticleColor);

    let startTime;
    const duration = 30000; // 30 second transition

    const animateColors = (currentTime) => {
      if (!startTime) startTime = currentTime;
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      const currentParticleColor = startParticleColor.lerp(
        targetParticleColorObj,
        progress
      );

      if (particlesRef.current && particlesRef.current.material) {
        particlesRef.current.material.color.copy(currentParticleColor);
        particlesRef.current.material.needsUpdate = true;
      }

      if (progress < 1) {
        colorTransitionRef.current = requestAnimationFrame(animateColors);
      }
    };

    colorTransitionRef.current = requestAnimationFrame(animateColors);
  };

  const settings = {
    particleColor,
    camera: {
      fov: 120,
      near: 0.1,
      far: 2000,
      initialPosition: { x: 0, y: 0, z: 400 },
      lookAt: { x: 0, y: 0, z: -100 },
    },
    bloomPass: {
      threshold: 0.1,
      strength: 1.2,
      radius: 0.8,
    },
  };

  const vegastudioLogo =
    "https://res.cloudinary.com/dtps5ugbf/image/upload/v1728682216/undefined_-_Imgur_qaenka.png";

  const themeImages = {
    themeActive1: vegastudioLogo,
    themeActive2: vegastudioLogo,
    themeActive3: vegastudioLogo,
    themeActive4: vegastudioLogo,
  };

  const getImageData = (image) => {
    const canvas = document.createElement("canvas");
    canvas.width = image.width;
    canvas.height = image.height;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(image, 0, 0);
    return ctx.getImageData(0, 0, image.width, image.height);
  };

  const drawTheMap = (currentParticleColor, imagedata) => {
    if (!imagedata) {
      console.warn("Image data is not yet available.");
      return;
    }
    if (particlesRef.current) {
      return;
    }

    console.log("Drawing map with color:", currentParticleColor);

    const circleTexture = (() => {
      const canvas = document.createElement("canvas");
      const size = 256;
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d");

      const gradient = ctx.createRadialGradient(
        size / 2,
        size / 2,
        0,
        size / 2,
        size / 2,
        size / 2
      );
      gradient.addColorStop(0, "rgba(255, 255, 255, 1)");
      gradient.addColorStop(0.2, "rgba(255, 255, 255, 0.8)");
      gradient.addColorStop(0.5, "rgba(255, 255, 255, 0.3)");
      gradient.addColorStop(1, "rgba(255, 255, 255, 0)");

      ctx.beginPath();
      ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();

      const texture = new THREE.Texture(canvas);
      texture.needsUpdate = true;
      return texture;
    })();

    const geometry = new THREE.BufferGeometry();

    const material = new THREE.PointsMaterial({
      size: 5.0,
      color: new THREE.Color(currentParticleColor),
      map: circleTexture,
      transparent: true,
      opacity: 1,
      sizeAttenuation: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    const vertices = [];
    const destinations = [];

    const dispersionRange = 4000;
    const depthRange = 200;

    const yStep = 2;
    const xStep = 6;

    for (let y = 0, y2 = imagedata.height; y < y2; y += yStep) {
      for (let x = 0, x2 = imagedata.width; x < x2; x += xStep) {
        if (imagedata.data[(y * imagedata.width + x) * 4 + 12] > 128) {
          const vertex = new THREE.Vector3();

          const theta = Math.random() * Math.PI * 2;
          const phi = Math.random() * Math.PI;
          const r = dispersionRange * (0.5 + Math.random() * 0.5);

          vertex.x = r * Math.sin(phi) * Math.cos(theta);
          vertex.y = r * Math.sin(phi) * Math.sin(theta);
          vertex.z = r * Math.cos(phi);

          const finalZ = (Math.random() - 0.5) * depthRange;
          vertex.destination = {
            x: x - imagedata.width / 2,
            y: -y + imagedata.height / 2,
            z: finalZ,
          };

          vertices.push(vertex.x, vertex.y, vertex.z);
          destinations.push(
            vertex.destination.x,
            vertex.destination.y,
            vertex.destination.z
          );
        }
      }
    }

    geometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(vertices, 3)
    );
    geometry.setAttribute(
      "destination",
      new THREE.Float32BufferAttribute(destinations, 3)
    );

    particlesRef.current = new THREE.Points(geometry, material);
    sceneRef.current.add(particlesRef.current);

    requestAnimationFrame(render);
  };

  const init = (color) => {
    console.log("Init called with color:", color);
    console.log("Initializing scene with color:", color);
    rendererRef.current = new THREE.WebGLRenderer({
      antialias: true,
      canvas: rendererRef.current,
      alpha: true,
      premultipliedAlpha: false,
    });
    rendererRef.current.setSize(ww, wh);
    rendererRef.current.setClearColor(0x000000, 0);
    rendererRef.current.autoClear = false;

    sceneRef.current = new THREE.Scene();

    cameraRef.current = new THREE.PerspectiveCamera(
      settings.camera.fov,
      ww / wh,
      settings.camera.near,
      settings.camera.far
    );
    cameraRef.current.position.set(
      settings.camera.initialPosition.x,
      settings.camera.initialPosition.y,
      settings.camera.initialPosition.z
    );
    cameraRef.current.lookAt(
      new THREE.Vector3(
        settings.camera.lookAt.x,
        settings.camera.lookAt.y,
        settings.camera.lookAt.z
      )
    );
    sceneRef.current.add(cameraRef.current);

    const controls = new OrbitControls(
      cameraRef.current,
      rendererRef.current.domElement
    );
    controls.minPolarAngle = Math.PI / 4;
    controls.maxPolarAngle = (3 * Math.PI) / 4;

    composerRef.current = new EffectComposer(rendererRef.current);
    const renderScene = new RenderPass(sceneRef.current, cameraRef.current);
    composerRef.current.addPass(renderScene);

    const imageURL = themeImages[Object.keys(theme).find((key) => theme[key])];

    const textureLoader = new THREE.TextureLoader();
    textureLoader.load(
      imageURL,
      (texture) => {
        const imagedata = getImageData(texture.image);
        drawTheMap(color, imagedata);
      },
      undefined,
      (error) => {
        console.error("Error loading texture:", error);
      }
    );
  };

  const handleMouseMove = (event) => {
    // Convert mouse coordinates to normalized device coordinates (-1 to +1)
    mouseRef.current.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouseRef.current.y = -(event.clientY / window.innerHeight) * 2 + 1;

    // Convert mouse position to world coordinates
    const vector = new THREE.Vector3(mouseRef.current.x, mouseRef.current.y, 0);
    vector.unproject(cameraRef.current);
    const dir = vector.sub(cameraRef.current.position).normalize();
    const distance = -cameraRef.current.position.z / dir.z;
    mouseRef.current.worldPosition = cameraRef.current.position
      .clone()
      .add(dir.multiplyScalar(distance));
  };

  const render = (a) => {
    requestAnimationFrame(render);

    if (rendererRef.current) {
      rendererRef.current.clear();
    }

    if (
      particlesRef.current &&
      particlesRef.current.geometry.attributes.position &&
      particlesRef.current.geometry.attributes.destination
    ) {
      const positions = particlesRef.current.geometry.attributes.position.array;
      const destinations =
        particlesRef.current.geometry.attributes.destination.array;
      const time = Date.now() * 0.0005;

      raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current);
      const intersects = raycasterRef.current.intersectObject(
        particlesRef.current
      );

      const mousePosition = new THREE.Vector3(
        mouseRef.current.x * 200,
        mouseRef.current.y * 200,
        0
      );

      for (let i = 0, j = positions.length; i < j; i += 3) {
        const dx = destinations[i] - positions[i];
        const dy = destinations[i + 1] - positions[i + 1];
        const dz = destinations[i + 2] - positions[i + 2];

        positions[i] += dx * animationSpeedRef.current;
        positions[i + 1] += dy * animationSpeedRef.current;
        positions[i + 2] += dz * animationSpeedRef.current;

        const distanceFromCenter = Math.sqrt(
          destinations[i] * destinations[i] +
            destinations[i + 1] * destinations[i + 1]
        );
        const amplitude = Math.max(0.2, 1 - distanceFromCenter / 100);

        const particlePosition = new THREE.Vector3(
          positions[i],
          positions[i + 1],
          positions[i + 2]
        );

        // Use world position for distance calculation
        const distance = particlePosition.distanceTo(
          mouseRef.current.worldPosition
        );
        const repulsionRadius = 150;

        if (distance < repulsionRadius) {
          const repulsionForce = (1 - distance / repulsionRadius) * 8;
          const angle = Math.atan2(
            particlePosition.y - mouseRef.current.worldPosition.y,
            particlePosition.x - mouseRef.current.worldPosition.x
          );

          const wave = Math.sin(distance * 0.05 + time * 2) * 0.5 + 0.5;
          const waveForce = repulsionForce * wave;

          const spiralAngle = distance * 0.01 + time;
          const spiralX = Math.cos(spiralAngle) * waveForce * 2;
          const spiralY = Math.sin(spiralAngle) * waveForce * 2;

          positions[i] += Math.cos(angle) * repulsionForce * 2 + spiralX;
          positions[i + 1] += Math.sin(angle) * repulsionForce * 2 + spiralY;
          positions[i + 2] += Math.sin(time * 2) * waveForce * 2;

          const jitter = Math.sin(time * 10 + distance) * 0.2;
          positions[i] += jitter;
          positions[i + 1] += jitter;
          positions[i + 2] += jitter;
        }

        positions[i] +=
          Math.sin(time + destinations[i] * 0.01) * amplitude * 0.3;
        positions[i + 1] +=
          Math.cos(time + destinations[i + 1] * 0.01) * amplitude * 0.3;
        positions[i + 2] +=
          Math.sin(time * 1.5 + destinations[i + 2] * 0.01) * amplitude * 0.2;

        positions[i] += (Math.random() - 0.5) * 0.05;
        positions[i + 1] += (Math.random() - 0.5) * 0.05;
        positions[i + 2] += (Math.random() - 0.5) * 0.05;
      }

      particlesRef.current.geometry.attributes.position.needsUpdate = true;
    }

    if (cameraRef.current && !isSpinningRef.current) {
      const time = Date.now() * 0.0002;
      const initialZ = 400;
      const zAmplitude = 50;
      const xAmplitude = 100;
      const fovAmplitude = 10;
      const initialFOV = 110;

      cameraRef.current.position.z = initialZ + Math.sin(time) * zAmplitude;
      cameraRef.current.position.x = Math.sin(time * 0.5) * xAmplitude;
      cameraRef.current.fov = initialFOV + Math.sin(time * 0.5) * fovAmplitude;
      cameraRef.current.lookAt(
        Math.sin(time * 0.2) * 10,
        Math.cos(time * 0.2) * 10,
        0
      );
      cameraRef.current.updateProjectionMatrix();
    }

    if (composerRef.current) {
      composerRef.current.render();
    }
  };

  const cleanup = () => {
    if (
      sceneRef.current &&
      particlesRef.current &&
      particlesRef.current.geometry &&
      particlesRef.current.material
    ) {
      sceneRef.current.remove(particlesRef.current);
      particlesRef.current.geometry.dispose();
      particlesRef.current.material.dispose();
    }
    if (colorTransitionRef.current) {
      cancelAnimationFrame(colorTransitionRef.current);
    }
  };

  const handleResize = () => {
    ww = window.innerWidth;
    wh = window.innerHeight;
    if (rendererRef.current && cameraRef.current) {
      rendererRef.current.setSize(ww, wh);
      cameraRef.current.aspect = ww / wh;
      cameraRef.current.updateProjectionMatrix();
    }
  };

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
      cleanup();
    };
  }, []);

  const spinCamera = () => {
    if (!cameraRef.current || isSpinningRef.current) return;

    isSpinningRef.current = true;
    const camera = cameraRef.current;

    const startRadius = Math.sqrt(
      camera.position.x * camera.position.x +
        camera.position.z * camera.position.z
    );
    const startY = camera.position.y;

    const tl = gsap.timeline({
      onComplete: () => {
        isSpinningRef.current = false;
        spinCompleteRef.current = true;
      },
    });

    tl.to(
      {},
      {
        duration: 4,
        onUpdate: function () {
          const progress = this.progress();
          const angle = progress * Math.PI * 2;

          camera.position.x = Math.sin(angle) * startRadius;
          camera.position.z = Math.cos(angle) * startRadius;
          camera.position.y = startY;
          camera.lookAt(0, 0, 0);
        },
        ease: "power2.inOut",
      }
    );
  };

  return (
    <>
      <div
        className={styles.intro}
        ref={introRef}
        style={{
          display: showIntro ? "flex" : "none",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <div>WE ARE A DIGITAL-FIRST,</div>
        <div>DESIGN-TECH STUDIO HELPING BRANDS</div>
        <div>ENGAGE, INNOVATE, AND BUILD</div>
        <div>MULTI-DIMENSIONAL EXPERIENCES.</div>
      </div>
      <div
        className={styles.cornerElements}
        ref={cornerElementsRef}
        style={{ display: showIntro ? "block" : "none" }}
      >
        <div className={styles.topLeft}>
          <MatrixText text="NEW YORK" delay={2000} />
        </div>
        <div className={styles.topRight}>
          <MatrixText text="VEGA STUDIO" delay={2500} />
        </div>
        <div className={styles.bottomLeft}>
          <MatrixText
            text={`2017 - ${new Date().getFullYear()} VEGA INC.`}
            delay={3000}
          />
          <br />
          <MatrixText text="ALL RIGHTS RESERVED" delay={3500} />
        </div>
        <div className={styles.bottomRight}>
          <MatrixText text="DIGITAL-FIRST" delay={4000} />
          <br />
          <MatrixText text="DESIGN-TECH" delay={4500} />
        </div>
      </div>
      <canvas
        className={styles.mainbg}
        ref={rendererRef}
        style={{ opacity: 1 }}
      />
    </>
  );
};

export default MapComponent;
