"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { ConvexGeometry } from "three/examples/jsm/geometries/ConvexGeometry.js";

const GOLD = 0xd4a441;

/**
 * A dark studio with long warm softbox strips — the environment map is what
 * gives polished gold its characteristic elongated reflections.
 */
function buildStudioEnvironment() {
  const studio = new THREE.Scene();
  studio.background = new THREE.Color(0x0c0a07);

  const strip = (
    width: number,
    height: number,
    intensity: number,
    hex: number
  ) => {
    const material = new THREE.MeshBasicMaterial();
    material.color.set(hex).multiplyScalar(intensity);
    return new THREE.Mesh(new THREE.PlaneGeometry(width, height), material);
  };

  const top = strip(7, 2.6, 7, 0xfff1dd);
  top.position.set(0, 5, 0.5);
  top.rotation.x = Math.PI / 2;
  studio.add(top);

  const left = strip(1.1, 9, 5.5, 0xffffff);
  left.position.set(-5, 1, 1);
  left.rotation.y = Math.PI / 2;
  studio.add(left);

  const right = strip(1.7, 9, 3.5, 0xffe2b4);
  right.position.set(5, 0, -1);
  right.rotation.y = -Math.PI / 2;
  studio.add(right);

  const back = strip(9, 0.9, 2.6, 0xffd9a6);
  back.position.set(0, 3, -6);
  studio.add(back);

  const front = strip(7, 1.1, 1.3, 0xffffff);
  front.position.set(0, -2.2, 6);
  front.rotation.y = Math.PI;
  studio.add(front);

  return studio;
}

/**
 * Figure-eight (lemniscate) lying in the ring's plane, bowed slightly so its
 * tips droop to meet the two open ends of the band.
 */
class InfinityCurve extends THREE.Curve<THREE.Vector3> {
  constructor(
    private readonly halfWidth: number,
    private readonly droop: number,
    private readonly centerY: number
  ) {
    super();
  }

  getPoint(t: number, target = new THREE.Vector3()) {
    const T = t * Math.PI * 2;
    const denom = 1 + Math.sin(T) * Math.sin(T);
    const x = (this.halfWidth * Math.cos(T)) / denom;
    const lobe = (this.halfWidth * Math.sin(T) * Math.cos(T)) / denom;
    const bow = this.droop * (x / this.halfWidth) * (x / this.halfWidth);
    return target.set(x, this.centerY + lobe - bow, 0);
  }
}

type JewelryMaterials = ReturnType<typeof buildJewelryMaterials>;

function buildJewelryMaterials() {
  const gold = new THREE.MeshPhysicalMaterial({
    color: GOLD,
    metalness: 1,
    roughness: 0.12,
    envMapIntensity: 1.35,
    clearcoat: 0.5,
    clearcoatRoughness: 0.2
  });
  const whiteGold = new THREE.MeshPhysicalMaterial({
    color: 0xf3efe6,
    metalness: 1,
    roughness: 0.24,
    envMapIntensity: 1.15
  });
  // Tiny pavé stones read best faceted hard
  const paveDiamond = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    metalness: 0,
    roughness: 0,
    transmission: 0.85,
    thickness: 0.4,
    ior: 2.417,
    dispersion: 0.35,
    envMapIntensity: 3.2,
    specularIntensity: 1,
    flatShading: true,
    transparent: true
  });
  const brilliantDiamond = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    metalness: 0,
    roughness: 0,
    transmission: 0.9,
    thickness: 1.4,
    ior: 2.417,
    dispersion: 0.35,
    envMapIntensity: 3,
    specularIntensity: 1,
    transparent: true
  });
  return { gold, whiteGold, paveDiamond, brilliantDiamond };
}

/** Round brilliant cut as a convex hull: octagonal table, 16-sided girdle, culet. */
function buildBrilliantGeometry(girdleRadius: number) {
  const points: THREE.Vector3[] = [];
  for (let i = 0; i < 8; i += 1) {
    const a = ((i + 0.5) / 8) * Math.PI * 2;
    points.push(
      new THREE.Vector3(
        Math.cos(a) * girdleRadius * 0.55,
        girdleRadius * 0.47,
        Math.sin(a) * girdleRadius * 0.55
      )
    );
  }
  for (let i = 0; i < 16; i += 1) {
    const a = (i / 16) * Math.PI * 2;
    const x = Math.cos(a) * girdleRadius;
    const z = Math.sin(a) * girdleRadius;
    points.push(new THREE.Vector3(x, girdleRadius * 0.06, z));
    points.push(new THREE.Vector3(x, -girdleRadius * 0.06, z));
  }
  points.push(new THREE.Vector3(0, -girdleRadius * 1.24, 0));
  return new ConvexGeometry(points);
}

/** Classic gold solitaire: D-profile shank, four-prong basket, brilliant-cut stone. */
function buildSolitaireRing({ gold, brilliantDiamond }: JewelryMaterials) {
  const ring = new THREE.Group();

  // D-profile shank: a torus flattened front-to-back reads as a real band
  const band = new THREE.Mesh(new THREE.TorusGeometry(1.5, 0.17, 48, 200), gold);
  band.scale.z = 0.72;
  ring.add(band);

  const head = new THREE.Group();
  head.position.y = 2.2;

  const stone = new THREE.Mesh(buildBrilliantGeometry(0.34), brilliantDiamond);
  head.add(stone);

  // Four prongs rise from the basket and curve in over the girdle
  for (let k = 0; k < 4; k += 1) {
    const a = Math.PI / 4 + (k * Math.PI) / 2;
    const cos = Math.cos(a);
    const sin = Math.sin(a);
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(cos * 0.42, -0.5, sin * 0.42),
      new THREE.Vector3(cos * 0.45, -0.12, sin * 0.45),
      new THREE.Vector3(cos * 0.3, 0.12, sin * 0.3)
    ]);
    const prong = new THREE.Mesh(new THREE.TubeGeometry(curve, 20, 0.04, 12), gold);
    head.add(prong);
    const tip = new THREE.Mesh(new THREE.SphereGeometry(0.048, 16, 12), gold);
    tip.position.set(cos * 0.3, 0.12, sin * 0.3);
    head.add(tip);
  }

  const rail = new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.032, 16, 48), gold);
  rail.rotation.x = Math.PI / 2;
  rail.position.y = -0.5;
  head.add(rail);

  const lowerRail = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.028, 16, 48), gold);
  lowerRail.rotation.x = Math.PI / 2;
  lowerRail.position.y = -0.68;
  head.add(lowerRail);

  const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.24, 0.34, 24), gold);
  stem.position.y = -0.71;
  head.add(stem);

  ring.add(head);
  ring.position.y = -0.85;
  return ring;
}

/** The Mahseri infinity ring: open band bridged by a pavé-set figure eight. */
function buildInfinityRing({ gold, whiteGold, paveDiamond }: JewelryMaterials) {
  const ring = new THREE.Group();

  // Thin open band leaving a gap at the top for the infinity link
  const radius = 1.5;
  const gapHalf = Math.PI / 5.4;
  const band = new THREE.Mesh(
    new THREE.TorusGeometry(radius, 0.082, 32, 220, Math.PI * 2 - 2 * gapHalf),
    gold
  );
  band.rotation.z = Math.PI / 2 + gapHalf;
  band.scale.z = 0.85;
  ring.add(band);

  // Rounded caps where the open band meets the infinity element
  for (const side of [-1, 1]) {
    const angle = Math.PI / 2 + side * gapHalf;
    const cap = new THREE.Mesh(new THREE.SphereGeometry(0.082, 16, 12), gold);
    cap.position.set(Math.cos(angle) * radius, Math.sin(angle) * radius, 0);
    cap.scale.z = 0.85;
    ring.add(cap);
  }

  // Infinity link bridging the gap
  const tipX = Math.cos(Math.PI / 2 - gapHalf) * radius;
  const tipY = Math.sin(Math.PI / 2 - gapHalf) * radius;
  const infinity = new InfinityCurve(tipX + 0.06, 1.56 - tipY, 1.56);
  const link = new THREE.Mesh(new THREE.TubeGeometry(infinity, 240, 0.06, 16, true), gold);
  ring.add(link);

  // Pavé strand: a white-gold channel with tiny diamonds along one half
  // of the figure eight (t 0.28..0.52 runs tip-to-tip through the crossing)
  const paveStart = 0.28;
  const paveEnd = 0.52;
  const channelPath = new THREE.CatmullRomCurve3(
    Array.from({ length: 32 }, (_, i) =>
      infinity.getPoint(paveStart + (i / 31) * (paveEnd - paveStart)).setZ(0.012)
    )
  );
  const channel = new THREE.Mesh(new THREE.TubeGeometry(channelPath, 120, 0.07, 14), whiteGold);
  ring.add(channel);

  for (let i = 0; i < 15; i += 1) {
    const t = paveStart + ((i + 0.5) / 15) * (paveEnd - paveStart);
    const point = infinity.getPoint(t);
    const gem = new THREE.Mesh(new THREE.OctahedronGeometry(0.045, 0), paveDiamond);
    gem.position.set(point.x, point.y, 0.075);
    gem.rotation.set(Math.random(), Math.random(), Math.random());
    ring.add(gem);
  }

  ring.position.y = -0.1;
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
    scene.environment = pmrem.fromScene(buildStudioEnvironment(), 0.03).texture;

    const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 60);
    camera.position.set(0, 0, 7.5);

    const key = new THREE.DirectionalLight(0xfff0d4, 2.4);
    key.position.set(-4, 6, 5);
    scene.add(key);
    const rim = new THREE.PointLight(GOLD, 24, 30);
    rim.position.set(5, -2, -4);
    scene.add(rim);

    // Two rings share the stage: each spins on its own axis inside a pivot,
    // and the pivots ride a slowly turning "duet" carousel so the rings trade
    // the front position as the visitor scrolls.
    const materials = buildJewelryMaterials();
    const orbitRadius = 1.15;

    const parallax = new THREE.Group();
    const duet = new THREE.Group();

    const infinitySpin = new THREE.Group();
    infinitySpin.add(buildInfinityRing(materials));
    const infinityPivot = new THREE.Group();
    infinityPivot.position.set(-orbitRadius, 0.2, 0);
    infinityPivot.scale.setScalar(0.62);
    infinityPivot.add(infinitySpin);
    duet.add(infinityPivot);

    const solitaireSpin = new THREE.Group();
    solitaireSpin.add(buildSolitaireRing(materials));
    const solitairePivot = new THREE.Group();
    solitairePivot.position.set(orbitRadius, -0.05, 0);
    solitairePivot.scale.setScalar(0.54);
    solitairePivot.add(solitaireSpin);
    duet.add(solitairePivot);

    parallax.add(duet);
    scene.add(parallax);

    const sparkles = buildSparkles();
    scene.add(sparkles);

    let wide = true;
    // Wide screens spread the pair side by side; narrow ones stack them in
    // depth so both fit the portrait frame.
    let duetBase = -0.42;
    const resize = () => {
      const { clientWidth: w, clientHeight: h } = host;
      if (!w || !h) return;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      wide = w > 900;
      parallax.position.x = wide ? 1.75 : 0;
      parallax.position.y = wide ? 0 : 0.9;
      duetBase = wide ? -0.42 : -1.18;
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

      duet.rotation.y = duetBase + idle * 0.15 + dragOffset * 0.35 + p * Math.PI;
      infinitySpin.rotation.y = idle + dragOffset + p * Math.PI * 2;
      solitaireSpin.rotation.y = 0.6 + idle * 1.2 + dragOffset + p * Math.PI * 2;
      parallax.rotation.x += (0.5 - p * 0.62 + tiltTargetX - parallax.rotation.x) * 0.06;
      parallax.rotation.y += (tiltTargetY - parallax.rotation.y) * 0.06;
      const scale = (wide ? 1 : 0.64) * (1 + p * 0.1);
      parallax.scale.setScalar(scale);
      camera.position.z = 7.5 - p * 0.9;
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
          <span className="cine-hint-icon">↻</span> Drag the rings
        </div>
        <div className="cine-cue" ref={cueRef} aria-hidden="true">
          Scroll
        </div>
      </div>
    </section>
  );
}
