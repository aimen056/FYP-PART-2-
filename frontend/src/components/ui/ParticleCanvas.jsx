import React, { useEffect, useRef } from "react";

const ParticleCanvas = () => {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const rendererRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Check WebGL support without acquiring context (use offscreen check)
    const testCanvas = document.createElement("canvas");
    const gl = testCanvas.getContext("webgl") || testCanvas.getContext("experimental-webgl");
    if (!gl) return;

    let Three;
    import("three").then((module) => {
      Three = module;
      const { Scene, PerspectiveCamera, WebGLRenderer, BufferGeometry, BufferAttribute, PointsMaterial, Points, Color } = Three;

      const scene = new Scene();
      const camera = new PerspectiveCamera(75, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
      camera.position.z = 5;

      let renderer;
      try {
        renderer = new WebGLRenderer({ canvas, alpha: true, antialias: false });
      } catch {
        return;
      }
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(canvas.clientWidth, canvas.clientHeight);
      rendererRef.current = renderer;

      // Particles
      const COUNT = 200;
      const positions = new Float32Array(COUNT * 3);
      const colors = new Float32Array(COUNT * 3);
      const velocities = new Float32Array(COUNT * 3);

      const colorA = new Color("#0EA5E9"); // sky blue
      const colorB = new Color("#10B981"); // emerald

      for (let i = 0; i < COUNT; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 12;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 8;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 6;

        const t = Math.random();
        const c = colorA.clone().lerp(colorB, t);
        colors[i * 3] = c.r;
        colors[i * 3 + 1] = c.g;
        colors[i * 3 + 2] = c.b;

        velocities[i * 3] = (Math.random() - 0.5) * 0.002;
        velocities[i * 3 + 1] = (Math.random() - 0.5) * 0.002;
        velocities[i * 3 + 2] = 0;
      }

      const geo = new BufferGeometry();
      geo.setAttribute("position", new BufferAttribute(positions, 3));
      geo.setAttribute("color", new BufferAttribute(colors, 3));

      const mat = new PointsMaterial({ size: 0.06, vertexColors: true, transparent: true, opacity: 0.7 });
      const points = new Points(geo, mat);
      scene.add(points);

      const animate = () => {
        rafRef.current = requestAnimationFrame(animate);
        const pos = geo.attributes.position.array;
        for (let i = 0; i < COUNT; i++) {
          pos[i * 3] += velocities[i * 3];
          pos[i * 3 + 1] += velocities[i * 3 + 1];
          // Wrap around
          if (pos[i * 3] > 6) pos[i * 3] = -6;
          if (pos[i * 3] < -6) pos[i * 3] = 6;
          if (pos[i * 3 + 1] > 4) pos[i * 3 + 1] = -4;
          if (pos[i * 3 + 1] < -4) pos[i * 3 + 1] = 4;
        }
        geo.attributes.position.needsUpdate = true;
        renderer.render(scene, camera);
      };
      animate();

      // Resize
      const onResize = () => {
        camera.aspect = canvas.clientWidth / canvas.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(canvas.clientWidth, canvas.clientHeight);
      };
      window.addEventListener("resize", onResize);

      return () => {
        window.removeEventListener("resize", onResize);
        cancelAnimationFrame(rafRef.current);
        geo.dispose();
        mat.dispose();
        renderer.dispose();
        scene.clear();
      };
    });

    return () => {
      cancelAnimationFrame(rafRef.current);
      rendererRef.current?.dispose();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ width: "100%", height: "100%" }}
    />
  );
};

export default ParticleCanvas;
