import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import * as THREE from "three";

const LoadingPage = () => {
  const [loading, setLoading] = useState(true);
  const mountRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 4000); // 4s for animation visibility
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Three.js setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    mountRef.current.appendChild(renderer.domElement);

    // Add ambient light for a softer glow
    const ambientLight = new THREE.AmbientLight(0x00ff88, 0.3);
    scene.add(ambientLight);

    // Primary torus structure
    const maskGeometry = new THREE.TorusGeometry(10, 2, 16, 100);
    const maskMaterial = new THREE.MeshBasicMaterial({
      color: 0x00ff88,
      wireframe: true,
      transparent: true,
      opacity: 0.6,
    });
    const mask = new THREE.Mesh(maskGeometry, maskMaterial);
    mask.rotation.x = Math.PI / 2;
    scene.add(mask);

    // Secondary torus for depth
    const secondaryTorusGeometry = new THREE.TorusGeometry(8, 1.5, 16, 100);
    const secondaryTorusMaterial = new THREE.MeshBasicMaterial({
      color: 0x00ccff,
      wireframe: true,
      transparent: true,
      opacity: 0.4,
    });
    const secondaryTorus = new THREE.Mesh(secondaryTorusGeometry, secondaryTorusMaterial);
    secondaryTorus.rotation.x = Math.PI / 2;
    scene.add(secondaryTorus);

    camera.position.z = 50;

    // Animation loop
    const animate = (time) => {
      requestAnimationFrame(animate);
      mask.rotation.z += 0.005;
      secondaryTorus.rotation.z -= 0.003; // Counter-rotation for contrast
      // Gentle scale animation for both toruses
      mask.scale.set(1 + 0.1 * Math.sin(time * 0.001), 1 + 0.1 * Math.sin(time * 0.001), 1);
      secondaryTorus.scale.set(1 + 0.05 * Math.cos(time * 0.001), 1 + 0.05 * Math.cos(time * 0.001), 1);
      renderer.render(scene, camera);
    };
    animate(0);

    // Handle window resize
    const handleResize = () => {
      renderer.setSize(window.innerWidth, window.innerHeight);
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
    };
    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
      scene.remove(mask, secondaryTorus, ambientLight);
      renderer.dispose();
      if (mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div style={{ overflow: 'hidden', height: '100vh' }}>
      <AnimatePresence>
        {loading ? (
          <motion.div
            key="loading"
            className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-green-900 to-orange-400"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7 }}
            style={{ position: 'fixed', width: '100%', height: '100%' }}
          >
            {/* 3D Canvas */}
            <div ref={mountRef} className="absolute inset-0 z-0" />

            {/* Animated SVG logo */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1, type: "spring" }}
              className="relative z-20 mb-8"
            >
              <svg
                width="200"
                height="200"
                viewBox="0 0 200 200"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="filter drop-shadow-[0_0_15px_rgba(0,255,136,0.9)]"
              >
                <motion.path
                  d="M100 20C100 20 120 60 100 100C80 60 100 20 100 20"
                  stroke="#00FF88"
                  strokeWidth="8"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 2, ease: "easeInOut" }}
                />
                <motion.path
                  d="M100 180C100 180 80 140 100 100C120 140 100 180 100 180"
                  stroke="#00FF88"
                  strokeWidth="8"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 2, ease: "easeInOut" }}
                />
                <motion.circle
                  cx="100"
                  cy="100"
                  r="30"
                  fill="none"
                  stroke="#00FF88"
                  strokeWidth="8"
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1.2 }}
                  transition={{
                    repeat: Infinity,
                    repeatType: "reverse",
                    duration: 1.8,
                  }}
                />
              </svg>
            </motion.div>

            {/* Loading text */}
            <motion.h1
              className="relative z-20 text-6xl font-extrabold text-[#00FF88] mb-4 drop-shadow-[0_2px_6px_rgba(0,0,0,0.6)]"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
            >
              AirGuard
            </motion.h1>

            <motion.p
              className="relative z-20 text-2xl font-medium text-[#00FF88] mb-4 drop-shadow-[0_2px_6px_rgba(0,0,0,0.6)]"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
            >
              Breathing Clean, Living Green
            </motion.p>

            {/* New tagline */}
            <motion.p
              className="relative z-20 text-xl font-light text-[#00FF88] mb-8 drop-shadow-[0_2px_6px_rgba(0,0,0,0.6)]"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.8 }}
            >
              Your Gateway to Cleaner Air
            </motion.p>

            {/* Loading dots */}
            <motion.div className="relative z-20 flex space-x-3">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-5 h-5 bg-[#00FF88] rounded-full drop-shadow-[0_2px_6px_rgba(0,0,0,0.6)]"
                  initial={{ y: 0 }}
                  animate={{ y: [-10, 10, -10] }}
                  transition={{
                    repeat: Infinity,
                    duration: 1.8,
                    delay: i * 0.3,
                  }}
                />
              ))}
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            style={{ position: 'fixed', width: '100%', height: '100%' }}
          >
            {/* This is now the permanent view after loading */}
            <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-green-900 to-orange-400">
              <div ref={mountRef} className="absolute inset-0 z-0" />
              
              <div className="relative z-20 mb-8">
                <svg
                  width="200"
                  height="200"
                  viewBox="0 0 200 200"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="filter drop-shadow-[0_0_15px_rgba(0,255,136,0.9)]"
                >
                  <path
                    d="M100 20C100 20 120 60 100 100C80 60 100 20 100 20"
                    stroke="#00FF88"
                    strokeWidth="8"
                  />
                  <path
                    d="M100 180C100 180 80 140 100 100C120 140 100 180 100 180"
                    stroke="#00FF88"
                    strokeWidth="8"
                  />
                  <circle
                    cx="100"
                    cy="100"
                    r="30"
                    fill="none"
                    stroke="#00FF88"
                    strokeWidth="8"
                  />
                </svg>
              </div>

              <h1 className="relative z-20 text-6xl font-extrabold text-[#00FF88] mb-4 drop-shadow-[0_2px_6px_rgba(0,0,0,0.6)]">
                AirGuard
              </h1>

              <p className="relative z-20 text-2xl font-medium text-[#00FF88] mb-4 drop-shadow-[0_2px_6px_rgba(0,0,0,0.6)]">
                Breathing Clean, Living Green
              </p>

              <p className="relative z-20 text-xl font-light text-[#00FF88] mb-8 drop-shadow-[0_2px_6px_rgba(0,0,0,0.6)]">
                Your Gateway to Cleaner Air
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LoadingPage;