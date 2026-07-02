"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

const GOLD = 0xcfa14f;

function buildRing() {
  const gold = new THREE.MeshPhysicalMaterial({
    color: GOLD,
    metalness: 1,
    roughness: 0.16,
    envMapIntensity: 1.3,
    clearcoat: 0.35,
    clearcoatRoughness: 0.25
  });
  const diamond = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    metalness: 0,
    roughness: 0.02,
    transmission: 0.92,
    thickness: 0.9,
    ior: 2.417,
    envMapIntensity: 2.4,
    specularIntensity: 1,
    flatShading: true,
    transparent: true
  });

  const ring = new THREE.Group();

  const band = new THREE.Mesh(new THREE.TorusGeometry(1.5, 0.2, 64, 160), gold);
  ring.add(band);

  const head = new THREE.Group();
  head.position.y = 1.5;

  const seat = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.2, 0.3, 24), gold);
  seat.position.y = 0.28;
  head.add(seat);

  const pavilion = new THREE.Mesh(new THREE.ConeGeometry(0.42, 0.5, 8, 1), diamond);
  pavilion.rotation.x = Math.PI;
  pavilion.position.y = 0.62;
  head.add(pavilion);

  const crown = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.42, 0.18, 8, 1), diamond);
  crown.position.y = 0.96;
  head.add(crown);

  for (let k = 0; k < 4; k += 1) {
    const angle = Math.PI / 4 + (k * Math.PI) / 2;
    const prong = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.055, 0.5, 12), gold);
    prong.position.set(Math.cos(angle) * 0.37, 0.72, Math.sin(angle) * 0.37);
    head.add(prong);
  }

  ring.add(head);
  ring.position.y = -0.35;
  return ring;
}

function buildSparkles() {
  const count = 160;
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i += 1) {
    const radius = 3 + Math.random() * 4;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = radius * Math.cos(phi);
    positions[i * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta) - 1;
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  const material = new THREE.PointsMaterial({
    color: 0xe9d9a8,
    size: 0.035,
    transparent: true,
    opacity: 0.75,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });
  return new THREE.Points(geometry, material);
}

/** Ramp 0→1 over [a,b], hold 1 over [b,c], fall back to 0 over [c,d]. */
function fade(p: number, a: number, b: number, c: number, d: number) {
  if (p <= a || p >= d) return 0;
  if (p < b) return (p - a) / (b - a);
  if (p <= c) return 1;
  return 1 - (p - c) / (d - c);
}

export function CinematicHero() {
  const sectionRef = useRef<HTMLElement>(null);
  const canvasHostRef = useRef<HTMLDivElement>(null);
  const phaseRefs = useRef<Array<HTMLDivElement | null>>([]);
  const cueRef = useRef<HTMLDivElement>(null);
  const hintRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const host = canvasHostRef.current;
    if (!section || !host) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) section.classList.add("cine-static");

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    } catch {
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    host.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const pmrem = new THREE.PMREMGenerator(renderer);
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

    const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 60);
    camera.position.set(0, 0, 7.5);

    const key = new THREE.DirectionalLight(0xfff0d4, 2.4);
    key.position.set(-4, 6, 5);
    scene.add(key);
    const rim = new THREE.PointLight(GOLD, 24, 30);
    rim.position.set(5, -2, -4);
    scene.add(rim);

    const parallax = new THREE.Group();
    const spin = new THREE.Group();
    const ring = buildRing();
    spin.add(ring);
    parallax.add(spin);
    scene.add(parallax);

    const sparkles = buildSparkles();
    scene.add(sparkles);

    let wide = true;
    const resize = () => {
      const { clientWidth: w, clientHeight: h } = host;
      if (!w || !h) return;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      wide = w > 900;
      parallax.position.x = wide ? 1.55 : 0;
    };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(host);

    // Interaction state
    let idle = 0;
    let dragOffset = 0;
    let dragVelocity = 0;
    let dragging = false;
    let dragX = 0;
    let hasDragged = false;
    let tiltTargetX = 0;
    let tiltTargetY = 0;

    const el = renderer.domElement;
    el.style.touchAction = "pan-y";

    const onPointerDown = (event: PointerEvent) => {
      dragging = true;
      dragX = event.clientX;
      el.setPointerCapture(event.pointerId);
    };
    const onPointerMove = (event: PointerEvent) => {
      if (dragging) {
        const dx = event.clientX - dragX;
        dragX = event.clientX;
        dragVelocity = dx * 0.006;
        dragOffset += dragVelocity;
        if (!hasDragged && Math.abs(dx) > 2) {
          hasDragged = true;
          hintRef.current?.classList.add("cine-hint-hide");
        }
      } else {
        const bounds = host.getBoundingClientRect();
        tiltTargetY = ((event.clientX - bounds.left) / bounds.width - 0.5) * 0.4;
        tiltTargetX = ((event.clientY - bounds.top) / bounds.height - 0.5) * 0.22;
      }
    };
    const onPointerUp = () => {
      dragging = false;
    };
    el.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);

    const phaseWindows: Array<[number, number, number, number]> = [
      [-1, 0, 0.18, 0.34],
      [0.34, 0.48, 0.6, 0.74],
      [0.72, 0.86, 9, 10]
    ];

    let frame = 0;
    const clock = new THREE.Clock();

    const renderFrame = () => {
      const dt = Math.min(clock.getDelta(), 0.05);

      // Scroll progress through the pinned section (0 at top, 1 fully scrolled)
      const rect = section.getBoundingClientRect();

      // Skip the heavy work while the hero is scrolled out of view
      if (rect.bottom < -80) {
        if (!reduced) frame = requestAnimationFrame(renderFrame);
        return;
      }

      const span = rect.height - window.innerHeight;
      const p = reduced || span <= 0 ? 0 : Math.min(Math.max(-rect.top / span, 0), 1);

      idle += dt * 0.25;
      if (!dragging) {
        dragOffset += dragVelocity;
        dragVelocity *= 0.94;
      }

      spin.rotation.y = idle + dragOffset + p * Math.PI * 3;
      parallax.rotation.x += (0.5 - p * 0.62 + tiltTargetX - parallax.rotation.x) * 0.06;
      parallax.rotation.y += (tiltTargetY - parallax.rotation.y) * 0.06;
      const scale = (wide ? 1 : 0.78) * (1 + p * 0.16);
      parallax.scale.setScalar(scale);
      camera.position.z = 7.5 - p * 1.4;
      sparkles.rotation.y += dt * 0.02;

      phaseRefs.current.forEach((phase, index) => {
        if (!phase) return;
        const alpha = reduced
          ? index === 0
            ? 1
            : 0
          : fade(p, ...phaseWindows[index]);
        phase.style.opacity = alpha.toFixed(3);
        phase.style.transform = `translateY(${((1 - alpha) * 26).toFixed(1)}px)`;
        phase.style.pointerEvents = alpha > 0.5 ? "auto" : "none";
      });
      if (cueRef.current) {
        cueRef.current.style.opacity = String(Math.max(0, 1 - p * 12));
      }

      renderer.render(scene, camera);
      if (!reduced) frame = requestAnimationFrame(renderFrame);
    };

    if (reduced) {
      renderFrame();
    } else {
      frame = requestAnimationFrame(renderFrame);
    }

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      el.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      host.removeChild(el);
      pmrem.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <section className="cine-hero" ref={sectionRef}>
      <div className="cine-stage">
        <div className="cine-bg" />
        <div className="cine-canvas" ref={canvasHostRef} />
        <div className="cine-vignette" />

        <div className="cine-copy">
          <div
            className="cine-phase"
            ref={(node) => {
              phaseRefs.current[0] = node;
            }}
          >
            <p className="eyebrow">Amman atelier · since 1989</p>
            <h1>
              Gold that carries <em>your story</em> forward.
            </h1>
            <p className="cine-lead">
              From our family workshop in the heart of Amman — 21K and 18K gold,
              925 silver, and a finish only patient hands can give.
            </p>
            <div className="hero-actions">
              <Link className="btn btn-gold" href="/shop">
                Explore the collection
              </Link>
              <Link className="btn btn-light" href="/about">
                Our craft
              </Link>
            </div>
          </div>

          <div
            className="cine-phase"
            ref={(node) => {
              phaseRefs.current[1] = node;
            }}
          >
            <p className="eyebrow">Shaped by hand, not by machine</p>
            <h2>Thirty-five years at the same bench.</h2>
            <p className="cine-lead">
              Every Mahseri piece is cast, set, and polished in-house — no factories,
              no shortcuts, one standard.
            </p>
            <div className="cine-stats">
              <div>
                <strong>35+</strong>
                <span>Years of craft</span>
              </div>
              <div>
                <strong>100%</strong>
                <span>Made in-house</span>
              </div>
              <div>
                <strong>2yr</strong>
                <span>Gold warranty</span>
              </div>
            </div>
          </div>

          <div
            className="cine-phase"
            ref={(node) => {
              phaseRefs.current[2] = node;
            }}
          >
            <p className="eyebrow">Every facet earns its light</p>
            <h2>Made for moments that matter.</h2>
            <p className="cine-lead">
              Browse the collection online, or visit the atelier in downtown Amman
              for a private viewing.
            </p>
            <div className="hero-actions">
              <Link className="btn btn-gold" href="/shop">
                Shop the collection
              </Link>
            </div>
          </div>
        </div>

        <div className="cine-hint" ref={hintRef} aria-hidden="true">
          <span className="cine-hint-icon">↻</span> Drag the ring
        </div>
        <div className="cine-cue" ref={cueRef} aria-hidden="true">
          Scroll
        </div>
      </div>
    </section>
  );
}
