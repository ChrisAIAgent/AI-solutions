/**
 * Hero 3D Scene 鈥?sparse node network with proximity connections + mouse attraction.
 * Aurora gradient points, additive blending, reduced-motion safe, mobile-disabled.
 *
 * Returns { destroy } for cleanup, or null when the scene is skipped (mobile,
 * reduced motion, no WebGL, no canvas).
 */

import * as THREE from 'three';

const AURORA_A = 0x2EA7FF; // cyan
const AURORA_B = 0x7B2FFF; // brand purple
const AURORA_C = 0xC850C0; // magenta

export function initHeroScene(canvas) {
  if (!canvas) return null;

  // Skip on mobile for performance and battery.
  if (window.matchMedia('(max-width: 768px)').matches) return null;

  // Respect reduced-motion preference entirely.
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return null;

  // Cheap WebGL support probe before initializing the renderer.
  const probe = document.createElement('canvas');
  const gl =
    probe.getContext('webgl2') ||
    probe.getContext('webgl') ||
    probe.getContext('experimental-webgl');
  if (!gl) return null;

  const NODE_COUNT = 90;
  const CONNECTION_DISTANCE = 14;
  const SPREAD_X = 90;
  const SPREAD_Y = 55;
  const SPREAD_Z = 40;

  // ---------- Scene ----------
  const scene = new THREE.Scene();

  // ---------- Camera ----------
  const w0 = canvas.clientWidth || 1;
  const h0 = canvas.clientHeight || 1;
  const camera = new THREE.PerspectiveCamera(55, w0 / h0, 0.1, 200);
  camera.position.z = 48;

  // ---------- Renderer ----------
  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
    powerPreference: 'high-performance'
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(w0, h0, false);
  renderer.setClearColor(0x000000, 0);

  // ---------- Nodes (Points) ----------
  const positions = new Float32Array(NODE_COUNT * 3);
  const sizes = new Float32Array(NODE_COUNT);
  const velocities = new Float32Array(NODE_COUNT * 3);

  for (let i = 0; i < NODE_COUNT; i++) {
    positions[i * 3]     = (Math.random() - 0.5) * SPREAD_X;
    positions[i * 3 + 1] = (Math.random() - 0.5) * SPREAD_Y;
    positions[i * 3 + 2] = (Math.random() - 0.5) * SPREAD_Z;
    sizes[i] = 1.4 + Math.random() * 2.0;
    velocities[i * 3]     = (Math.random() - 0.5) * 0.04;
    velocities[i * 3 + 1] = (Math.random() - 0.5) * 0.04;
    velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.02;
  }

  const pointsGeo = new THREE.BufferGeometry();
  pointsGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  pointsGeo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

  const pointsMat = new THREE.ShaderMaterial({
    uniforms: {
      uTime:   { value: 0 },
      uColorA: { value: new THREE.Color(AURORA_A) },
      uColorB: { value: new THREE.Color(AURORA_B) },
      uColorC: { value: new THREE.Color(AURORA_C) }
    },
    vertexShader: /* glsl */`
      attribute float size;
      varying float vDepth;
      void main() {
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        // z drives the aurora gradient (front = cyan, back = magenta).
        vDepth = position.z;
        // Perspective-correct point size; clamp to keep tiny dots on hi-DPI.
        gl_PointSize = clamp(size * (320.0 / -mv.z), 1.5, 12.0);
        gl_Position = projectionMatrix * mv;
      }
    `,
    fragmentShader: /* glsl */`
      varying float vDepth;
      uniform vec3 uColorA;
      uniform vec3 uColorB;
      uniform vec3 uColorC;
      uniform float uTime;
      void main() {
        // Map depth [-SPREAD_Z/2, SPREAD_Z/2] -> [0,1].
        float t = clamp((vDepth + 20.0) / 40.0, 0.0, 1.0);
        vec3 color = (t < 0.5)
          ? mix(uColorA, uColorB, t * 2.0)
          : mix(uColorB, uColorC, (t - 0.5) * 2.0);

        // Gentle shared pulse for a "living network" feel.
        float pulse = 0.82 + 0.18 * sin(uTime * 1.6);
        color *= pulse;

        // Soft circular sprite (alpha falls off to 0 at the edge).
        vec2 uv = gl_PointCoord - 0.5;
        float d = length(uv);
        float a = smoothstep(0.5, 0.0, d) * 0.9;
        if (a < 0.01) discard;
        gl_FragColor = vec4(color, a);
      }
    `,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending
  });

  const points = new THREE.Points(pointsGeo, pointsMat);
  scene.add(points);

  // ---------- Connections (LineSegments) ----------
  // Max possible segments if every node connected to every other: N*(N-1)/2.
  const maxSegs = (NODE_COUNT * (NODE_COUNT - 1)) / 2;
  const linePositions = new Float32Array(maxSegs * 6);
  const lineGeo = new THREE.BufferGeometry();
  lineGeo.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
  lineGeo.setDrawRange(0, 0);

  const lineMat = new THREE.LineBasicMaterial({
    color: AURORA_B,
    transparent: true,
    opacity: 0.22,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });
  const lines = new THREE.LineSegments(lineGeo, lineMat);
  scene.add(lines);

  // ---------- Mouse parallax / attraction ----------
  const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
  function onMouseMove(e) {
    const rect = canvas.getBoundingClientRect();
    mouse.tx = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    mouse.ty = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
  }
  canvas.addEventListener('mousemove', onMouseMove);

  // ---------- Resize ----------
  function onResize() {
    const w = canvas.clientWidth || 1;
    const h = canvas.clientHeight || 1;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h, false);
  }
  window.addEventListener('resize', onResize);

  // ---------- Visibility (pause when tab hidden) ----------
  let isVisible = true;
  function onVisibilityChange() {
    if (document.hidden) {
      isVisible = false;
    } else if (!isVisible) {
      isVisible = true;
      lastTime = performance.now();
      rafId = requestAnimationFrame(tick);
    }
  }
  document.addEventListener('visibilitychange', onVisibilityChange);

  // ---------- Animation loop ----------
  let rafId = null;
  let lastTime = performance.now();

  function tick() {
    if (!isVisible) {
      rafId = null;
      return;
    }
    rafId = requestAnimationFrame(tick);

    const now = performance.now();
    const dt = Math.min((now - lastTime) / 1000, 0.05);
    lastTime = now;

    // Smooth mouse follow.
    mouse.x += (mouse.tx - mouse.x) * 0.05;
    mouse.y += (mouse.ty - mouse.y) * 0.05;

    const pos = pointsGeo.attributes.position.array;

    // Update node positions: drift + gentle pull toward mouse target.
    for (let i = 0; i < NODE_COUNT; i++) {
      const i3 = i * 3;
      pos[i3]     += velocities[i3]     * dt * 60;
      pos[i3 + 1] += velocities[i3 + 1] * dt * 60;
      pos[i3 + 2] += velocities[i3 + 2] * dt * 60;

      const tx = mouse.x * 22;
      const ty = -mouse.y * 16;
      pos[i3]     += (tx - pos[i3])     * 0.004;
      pos[i3 + 1] += (ty - pos[i3 + 1]) * 0.004;

      // Wrap-around so the field never empties.
      if (pos[i3]     >  SPREAD_X / 2) pos[i3]     = -SPREAD_X / 2;
      if (pos[i3]     < -SPREAD_X / 2) pos[i3]     =  SPREAD_X / 2;
      if (pos[i3 + 1] >  SPREAD_Y / 2) pos[i3 + 1] = -SPREAD_Y / 2;
      if (pos[i3 + 1] < -SPREAD_Y / 2) pos[i3 + 1] =  SPREAD_Y / 2;
      if (pos[i3 + 2] >  SPREAD_Z / 2) pos[i3 + 2] = -SPREAD_Z / 2;
      if (pos[i3 + 2] < -SPREAD_Z / 2) pos[i3 + 2] =  SPREAD_Z / 2;
    }
    pointsGeo.attributes.position.needsUpdate = true;

    // Rebuild connection segments (O(N^2); fine for N=90).
    let writeIdx = 0;
    const cd2 = CONNECTION_DISTANCE * CONNECTION_DISTANCE;
    for (let i = 0; i < NODE_COUNT; i++) {
      const ax = pos[i * 3], ay = pos[i * 3 + 1], az = pos[i * 3 + 2];
      for (let j = i + 1; j < NODE_COUNT; j++) {
        const dx = ax - pos[j * 3];
        const dy = ay - pos[j * 3 + 1];
        const dz = az - pos[j * 3 + 2];
        const d2 = dx * dx + dy * dy + dz * dz;
        if (d2 < cd2) {
          linePositions[writeIdx++] = ax;
          linePositions[writeIdx++] = ay;
          linePositions[writeIdx++] = az;
          linePositions[writeIdx++] = pos[j * 3];
          linePositions[writeIdx++] = pos[j * 3 + 1];
          linePositions[writeIdx++] = pos[j * 3 + 2];
        }
      }
    }
    lineGeo.setDrawRange(0, writeIdx / 3);
    lineGeo.attributes.position.needsUpdate = true;

    // Subtle parallax rotation driven by the mouse.
    points.rotation.y = mouse.x * 0.10;
    points.rotation.x = -mouse.y * 0.06;
    lines.rotation.copy(points.rotation);

    pointsMat.uniforms.uTime.value = now / 1000;

    renderer.render(scene, camera);
  }

  rafId = requestAnimationFrame(tick);

  // ---------- Cleanup ----------
  function destroy() {
    isVisible = false;
    if (rafId) cancelAnimationFrame(rafId);
    rafId = null;
    canvas.removeEventListener('mousemove', onMouseMove);
    window.removeEventListener('resize', onResize);
    document.removeEventListener('visibilitychange', onVisibilityChange);
    pointsGeo.dispose();
    pointsMat.dispose();
    lineGeo.dispose();
    lineMat.dispose();
    renderer.dispose();
  }

  return { destroy };
}
