"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { CSSProperties, PointerEvent } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import {
  ArrowRight,
  CalendarDays,
  Code2,
  HeartHandshake,
  Lightbulb,
  MessageCircle,
  Route,
  Sparkles,
  Video,
} from "lucide-react";
import * as THREE from "three";
import { RealtimeUsersBadge } from "@/components/realtime-users-badge";
import { ThemeToggle } from "@/components/theme-toggle";
import { WORKSHOP_FEEDBACK_URL } from "@/lib/app-config";

const storyChapters = [
  {
    eyebrow: "Capitolo 01",
    title: "Nora ha un prototipo, ma nessuno con cui parlarne davvero.",
    body: "Ha pushato alle due di notte, ha scritto tre DM e ha ricevuto solo emoji vaghe. Le serve una conversazione vera, non un altro thread motivazionale.",
    name: "Nora",
    role: "frontend builder",
    icon: Code2,
    vignette: {
      scene: "Repo acceso",
      line: "Un prototipo cerca una risposta sincera.",
      accent: "#34d399",
      tokens: ["02:17", "PR aperta", "DM muti"],
    },
  },
  {
    eyebrow: "Capitolo 02",
    title: "Marco cerca un segnale prima di mollare il progetto.",
    body: "Sta costruendo un tool B2B, ma gli manca qualcuno che faccia domande scomode. Non vuole una call fra diciassette giorni: vuole capire se ha senso continuare.",
    name: "Marco",
    role: "founder tecnico",
    icon: Lightbulb,
    vignette: {
      scene: "Pitch in bilico",
      line: "Una domanda giusta può salvare settimane.",
      accent: "#f59e0b",
      tokens: ["MVP", "B2B", "dubbi"],
    },
  },
  {
    eyebrow: "Capitolo 03",
    title: "Giulia vuole trovare persone vive, non profili da sfogliare.",
    body: "Sa fare product, conosce community e ha energia. Ma tra directory, cold outreach e gruppi immobili, sembra tutto troppo lento per chi vuole costruire.",
    name: "Giulia",
    role: "product maker",
    icon: MessageCircle,
    vignette: {
      scene: "Panchina piena",
      line: "Molte presenze, poca conversazione viva.",
      accent: "#60a5fa",
      tokens: ["community", "topic", "energia"],
    },
  },
  {
    eyebrow: "La svolta",
    title: "Poi passa la roulotte.",
    body: "DevRoulotte non promette il match perfetto. Apre una porta: una persona alla volta, cinque minuti, abbastanza poco per entrare e abbastanza tanto per cambiare traiettoria.",
    name: "DevRoulotte",
    role: "superconnector 1:1",
    icon: Route,
    vignette: {
      scene: "La porta si apre",
      line: "La roulotte trasforma il rumore in incontro.",
      accent: "#2dd4bf",
      tokens: ["WebRTC", "casuale", "1:1"],
    },
  },
  {
    eyebrow: "Il momento",
    title: "La casualità resta, ma finalmente succede qualcosa.",
    body: "Nora trova chi le rompe bene il frontend. Marco riceve una domanda che gli salva il pitch. Giulia incontra due persone con cui aprire una micro-community vera.",
    name: "5 minuti",
    role: "un builder alla volta",
    icon: HeartHandshake,
    vignette: {
      scene: "Timer vivo",
      line: "Abbastanza poco per entrare, abbastanza per svoltare.",
      accent: "#f472b6",
      tokens: ["05:00", "feedback", "contatto"],
    },
  },
  {
    eyebrow: "Missione",
    title: "Una piccola infrastruttura per far incontrare chi costruisce.",
    body: "La roulotte attraversa il rumore del networking italiano e lascia dietro contatti migliori, idee più chiare e meno persone ferme in panchina.",
    name: "Sali a bordo",
    role: "il futuro non aspetta il calendario",
    icon: Sparkles,
    vignette: {
      scene: "Nuova rotta",
      line: "Una micro-infrastruttura per chi costruisce davvero.",
      accent: "#a78bfa",
      tokens: ["missione", "Italia", "builder"],
    },
  },
];

const characterColors = [0x34d399, 0xf59e0b, 0x60a5fa];

function smoothStep(edge0: number, edge1: number, value: number) {
  const x = Math.min(Math.max((value - edge0) / (edge1 - edge0), 0), 1);
  return x * x * (3 - 2 * x);
}

function createCharacter(color: number) {
  const group = new THREE.Group();
  const bodyMaterial = new THREE.MeshStandardMaterial({
    color,
    roughness: 0.6,
    metalness: 0.05,
  });
  const headMaterial = new THREE.MeshStandardMaterial({
    color: 0xffd6a5,
    roughness: 0.7,
  });

  const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.16, 0.46, 8, 16), bodyMaterial);
  body.position.y = 0.45;
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.18, 24, 16), headMaterial);
  head.position.y = 0.9;
  const laptop = new THREE.Mesh(
    new THREE.BoxGeometry(0.42, 0.04, 0.26),
    new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.45 }),
  );
  laptop.position.set(0, 0.44, 0.18);

  group.add(body, head, laptop);
  return group;
}

function createCaravan() {
  const group = new THREE.Group();
  const bodyMaterial = new THREE.MeshStandardMaterial({
    color: 0xfff1cf,
    roughness: 0.52,
    metalness: 0.04,
  });
  const tealMaterial = new THREE.MeshStandardMaterial({
    color: 0x2dd4bf,
    roughness: 0.45,
    metalness: 0.08,
  });
  const darkMaterial = new THREE.MeshStandardMaterial({
    color: 0x06121f,
    roughness: 0.35,
    metalness: 0.12,
  });
  const amberMaterial = new THREE.MeshStandardMaterial({
    color: 0xf3b562,
    roughness: 0.5,
  });

  const body = new THREE.Mesh(new THREE.BoxGeometry(2.8, 1.28, 0.98), bodyMaterial);
  body.position.y = 0.86;
  const lower = new THREE.Mesh(new THREE.BoxGeometry(2.85, 0.36, 1.02), tealMaterial);
  lower.position.y = 0.38;
  const roof = new THREE.Mesh(new THREE.BoxGeometry(2.3, 0.18, 1.02), darkMaterial);
  roof.position.set(-0.05, 1.57, 0);
  const door = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.92, 0.08), amberMaterial);
  door.position.set(0.34, 0.82, 0.54);
  const leftWindow = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.42, 0.08), darkMaterial);
  leftWindow.position.set(-0.78, 1.02, 0.55);
  const rightWindow = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.42, 0.08), darkMaterial);
  rightWindow.position.set(1.02, 1.02, 0.55);
  const sign = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.28, 0.08), bodyMaterial);
  sign.position.set(-0.82, 0.5, 0.59);

  const wheelMaterial = new THREE.MeshStandardMaterial({
    color: 0x020617,
    roughness: 0.4,
    metalness: 0.1,
  });
  const hubMaterial = new THREE.MeshStandardMaterial({
    color: 0xfff1cf,
    roughness: 0.45,
  });
  [-0.88, 0.94].forEach((x) => {
    const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.18, 32), wheelMaterial);
    wheel.rotation.x = Math.PI / 2;
    wheel.position.set(x, 0.08, 0.52);
    const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.2, 24), hubMaterial);
    hub.rotation.x = Math.PI / 2;
    hub.position.set(x, 0.08, 0.63);
    group.add(wheel, hub);
  });

  const hitch = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.07, 0.08), darkMaterial);
  hitch.position.set(1.78, 0.25, 0.2);
  hitch.rotation.z = -0.12;

  group.add(body, lower, roof, door, leftWindow, rightWindow, sign, hitch);
  return group;
}

function createHeatmap() {
  const group = new THREE.Group();
  const cells: Array<THREE.Mesh<THREE.BoxGeometry, THREE.MeshStandardMaterial>> = [];

  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 7; col++) {
      const intensity = (Math.sin(col * 1.7 + row * 0.9) + 1) / 2;
      const material = new THREE.MeshStandardMaterial({
        color: new THREE.Color().setHSL(0.48, 0.72, 0.18 + intensity * 0.36),
        roughness: 0.5,
        transparent: true,
        opacity: 0.12,
      });
      const cell = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.04, 0.22), material);
      cell.position.set((col - 3) * 0.28, 0, (row - 1.5) * 0.28);
      group.add(cell);
      cells.push(cell);
    }
  }

  return { group, cells };
}

function createSignalLine(color: number) {
  const material = new THREE.LineBasicMaterial({
    color,
    transparent: true,
    opacity: 0.12,
  });
  const geometry = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(-1, 0.8, 0),
    new THREE.Vector3(1, 0.8, 0),
  ]);

  return new THREE.Line(geometry, material);
}

function VignetteMiniScene({ index }: { index: number }) {
  if (index === 0) {
    return (
      <>
        <div className="absolute left-5 top-5 h-16 w-24 rounded-md border border-white/15 bg-slate-950/85 p-2 [transform:translateZ(38px)]">
          <div className="mb-2 flex gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-rose-300" />
            <span className="h-1.5 w-1.5 rounded-full bg-amber-300" />
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
          </div>
          <div className="grid gap-1">
            <span className="h-1 rounded-full bg-teal-200/70" />
            <span className="h-1 w-14 rounded-full bg-white/30" />
            <span className="h-1 w-20 rounded-full bg-white/20" />
          </div>
        </div>
        <div className="absolute bottom-4 right-6 h-14 w-12 rounded-full bg-teal-300/80 [transform:translateZ(56px)]" />
      </>
    );
  }

  if (index === 1) {
    return (
      <>
        <div className="absolute bottom-5 left-7 h-16 w-20 rounded-md border border-amber-200/30 bg-amber-200/10 [transform:translateZ(36px)_rotateY(-8deg)]" />
        <div className="absolute left-16 top-5 h-12 w-12 rounded-full bg-amber-200 shadow-[0_0_34px_rgba(251,191,36,0.55)] [transform:translateZ(68px)]" />
        <div className="absolute bottom-7 right-7 h-3 w-24 rounded-full bg-amber-200/70 [transform:translateZ(50px)]" />
      </>
    );
  }

  if (index === 2) {
    return (
      <>
        {[0, 1, 2, 3].map((item) => (
          <span
            key={item}
            className="absolute h-9 w-9 rounded-full border border-sky-200/30 bg-sky-300/40 [transform:translateZ(44px)]"
            style={{
              left: `${24 + (item % 2) * 82}px`,
              top: `${24 + Math.floor(item / 2) * 54}px`,
            }}
          />
        ))}
        <div className="absolute left-12 top-16 h-px w-28 bg-sky-200/60 [transform:translateZ(60px)_rotateZ(-14deg)]" />
        <div className="absolute left-16 top-14 h-px w-24 bg-sky-200/50 [transform:translateZ(60px)_rotateZ(20deg)]" />
      </>
    );
  }

  if (index === 3) {
    return (
      <>
        <div className="absolute bottom-5 left-6 h-16 w-32 rounded-xl border border-teal-200/35 bg-amber-50/90 [transform:translateZ(44px)]" />
        <div className="absolute bottom-5 left-6 h-6 w-32 rounded-b-xl bg-teal-400 [transform:translateZ(48px)]" />
        <div className="absolute bottom-12 left-20 h-10 w-7 rounded-sm bg-amber-400 [transform:translateZ(58px)]" />
        <div className="absolute bottom-3 left-12 h-8 w-8 rounded-full bg-slate-950 [transform:translateZ(62px)]" />
        <div className="absolute bottom-3 left-32 h-8 w-8 rounded-full bg-slate-950 [transform:translateZ(62px)]" />
      </>
    );
  }

  if (index === 4) {
    return (
      <>
        <div className="absolute left-8 top-7 grid h-16 w-16 place-items-center rounded-full border border-pink-200/40 bg-pink-300/20 text-lg font-black text-pink-100 [transform:translateZ(62px)]">
          5
        </div>
        <div className="absolute left-28 top-14 h-1 w-24 rounded-full bg-pink-200/70 [transform:translateZ(44px)]" />
        <div className="absolute right-7 top-9 h-11 w-11 rounded-full bg-pink-200/70 [transform:translateZ(54px)]" />
        <div className="absolute bottom-5 right-8 h-8 w-20 rounded-md bg-white/10 [transform:translateZ(38px)]" />
      </>
    );
  }

  return (
    <>
      {[0, 1, 2, 3, 4].map((item) => (
        <span
          key={item}
          className="absolute h-2.5 w-2.5 rounded-full bg-violet-200 shadow-[0_0_18px_rgba(167,139,250,0.85)] [transform:translateZ(58px)]"
          style={{
            left: `${32 + item * 36}px`,
            top: `${34 + Math.sin(item) * 34}px`,
          }}
        />
      ))}
      <div className="absolute left-10 top-14 h-px w-36 bg-violet-200/55 [transform:translateZ(46px)_rotateZ(-10deg)]" />
      <div className="absolute bottom-6 right-7 h-14 w-20 rounded-t-full border border-violet-200/40 bg-violet-300/15 [transform:translateZ(36px)]" />
    </>
  );
}

export function LandingStoryScene() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const sectionRef = useRef<HTMLElement | null>(null);
  const chapterRefs = useRef<Array<HTMLElement | null>>([]);
  const progressRef = useRef(0);
  const [activeChapter, setActiveChapter] = useState(0);
  const [previewChapter, setPreviewChapter] = useState<number | null>(null);

  const shownChapter = previewChapter ?? activeChapter;

  const handleVignettePointerMove = (event: PointerEvent<HTMLButtonElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;

    event.currentTarget.style.setProperty("--vignette-rotate-x", `${(-y * 10).toFixed(2)}deg`);
    event.currentTarget.style.setProperty("--vignette-rotate-y", `${(x * 12).toFixed(2)}deg`);
  };

  const resetVignetteTilt = (event: PointerEvent<HTMLButtonElement>) => {
    event.currentTarget.style.setProperty("--vignette-rotate-x", "0deg");
    event.currentTarget.style.setProperty("--vignette-rotate-y", "0deg");
  };

  const scrollToChapter = (index: number) => {
    chapterRefs.current[index]?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
    setActiveChapter(index);
  };

  const renderVignetteButton = (
    chapter: (typeof storyChapters)[number],
    index: number,
  ) => {
    const Icon = chapter.icon;
    const isActive = index === activeChapter;
    const isPreviewed = index === shownChapter;

    return (
      <button
        key={chapter.title}
        type="button"
        data-testid={`landing-story-vignette-${index}`}
        aria-pressed={isActive}
        onClick={() => scrollToChapter(index)}
        onFocus={() => setPreviewChapter(index)}
        onBlur={() => setPreviewChapter(null)}
        onPointerEnter={() => setPreviewChapter(index)}
        onPointerMove={handleVignettePointerMove}
        onPointerLeave={(event) => {
          setPreviewChapter(null);
          resetVignetteTilt(event);
        }}
        className={`group grid min-h-28 min-w-[12.75rem] rounded-lg border p-2 text-left transition duration-300 [perspective:900px] focus:outline-none focus:ring-2 focus:ring-teal-200 sm:min-h-40 sm:min-w-[15.5rem] lg:min-h-48 lg:min-w-0 ${
          isPreviewed
            ? "border-teal-200/70 bg-white/[0.075]"
            : "border-white/10 bg-white/[0.035] hover:border-white/25 hover:bg-white/[0.06]"
        }`}
        style={
          {
            "--vignette-accent": chapter.vignette.accent,
            "--vignette-rotate-x": "0deg",
            "--vignette-rotate-y": "0deg",
          } as CSSProperties
        }
      >
        <span className="relative grid h-14 overflow-hidden rounded-md border border-white/10 bg-slate-950/70 [transform-style:preserve-3d] [transform:rotateX(var(--vignette-rotate-x))_rotateY(var(--vignette-rotate-y))] transition-transform duration-200 sm:h-24 lg:h-28">
          <span className="absolute inset-0 bg-[radial-gradient(circle_at_28%_22%,var(--vignette-accent),transparent_28%),linear-gradient(135deg,rgba(15,23,42,0.88),rgba(2,6,23,0.96))] opacity-70" />
          <span className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-black/70 to-transparent" />
          <VignetteMiniScene index={index} />
          <span className="absolute right-2 top-2 inline-flex h-7 w-7 items-center justify-center rounded-md border border-white/10 bg-black/30 text-white [transform:translateZ(70px)]">
            <Icon className="h-3.5 w-3.5" />
          </span>
        </span>
        <span className="grid gap-1 px-1 pt-3">
          <span className="text-[10px] font-black uppercase tracking-[0.16em] text-teal-100">
            {chapter.vignette.scene}
          </span>
          <span className="text-xs font-bold leading-5 text-white">
            {chapter.name}
          </span>
          <span className="hidden text-[11px] font-semibold leading-4 text-slate-300 sm:block">
            {chapter.vignette.line}
          </span>
          <span className="mt-1 hidden flex-wrap gap-1 sm:flex">
            {chapter.vignette.tokens.map((token) => (
              <span
                key={token}
                className="rounded border border-white/10 px-1.5 py-0.5 text-[10px] font-bold text-slate-300"
              >
                {token}
              </span>
            ))}
          </span>
        </span>
      </button>
    );
  };

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const lenis = prefersReducedMotion
      ? null
      : new Lenis({
          lerp: 0.08,
          smoothWheel: true,
          syncTouch: false,
        });

    if (lenis) {
      const updateLenis = (time: number) => lenis.raf(time * 1000);

      lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add(updateLenis);

      const cleanupLenis = () => {
        gsap.ticker.remove(updateLenis);
        lenis.destroy();
      };

      const trigger = sectionRef.current
        ? ScrollTrigger.create({
            trigger: sectionRef.current,
            start: "top top",
            end: "bottom bottom",
            scrub: 0.6,
            onUpdate: (self) => {
              progressRef.current = self.progress;
              setActiveChapter((current) => {
                const next = Math.min(
                  storyChapters.length - 1,
                  Math.floor(self.progress * storyChapters.length),
                );

                return current === next ? current : next;
              });
            },
          })
        : null;

      return () => {
        trigger?.kill();
        cleanupLenis();
      };
    }

    const trigger = sectionRef.current
      ? ScrollTrigger.create({
          trigger: sectionRef.current,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.6,
          onUpdate: (self) => {
            progressRef.current = self.progress;
            setActiveChapter((current) => {
              const next = Math.min(
                storyChapters.length - 1,
                Math.floor(self.progress * storyChapters.length),
              );

              return current === next ? current : next;
            });
          },
        })
      : null;

    return () => {
      trigger?.kill();
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      preserveDrawingBuffer: true,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.8));
    renderer.setClearColor(0x000000, 0);

    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x08111a, 6, 14);

    const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
    camera.position.set(0, 2.3, 7.4);

    const ambient = new THREE.AmbientLight(0x9ee7ff, 1.2);
    const key = new THREE.DirectionalLight(0xffffff, 2.1);
    key.position.set(2.4, 4.2, 3.6);
    const teal = new THREE.PointLight(0x2dd4bf, 3.8, 8);
    teal.position.set(-1.8, 1.2, 2.4);
    const amber = new THREE.PointLight(0xfbbf24, 2.8, 7);
    amber.position.set(2.3, 1.3, 1.8);
    scene.add(ambient, key, teal, amber);

    const road = new THREE.Mesh(
      new THREE.PlaneGeometry(18, 18, 24, 24),
      new THREE.MeshStandardMaterial({
        color: 0x0f172a,
        roughness: 0.82,
        metalness: 0.04,
      }),
    );
    road.rotation.x = -Math.PI / 2;
    road.position.y = -0.18;
    scene.add(road);

    const caravan = createCaravan();
    caravan.position.set(-3.8, 0, 0);
    caravan.rotation.y = -0.22;
    scene.add(caravan);

    const characters = characterColors.map((color, index) => {
      const character = createCharacter(color);
      character.position.set(-2.2 + index * 2.2, 0, 1.55 + index * 0.12);
      character.rotation.y = 0.22 - index * 0.18;
      scene.add(character);
      return character;
    });

    const signalLines = [0x34d399, 0xf59e0b, 0x60a5fa].map((color, index) => {
      const line = createSignalLine(color);
      line.position.z = 0.82 + index * 0.18;
      scene.add(line);
      return line;
    });

    const { group: heatmap, cells } = createHeatmap();
    heatmap.position.set(0, 0.08, -1.35);
    heatmap.rotation.x = -Math.PI / 2;
    scene.add(heatmap);

    const noiseCards = Array.from({ length: 22 }, (_, index) => {
      const material = new THREE.MeshStandardMaterial({
        color: index % 2 ? 0x1e293b : 0x0f766e,
        roughness: 0.6,
        transparent: true,
        opacity: 0.18,
      });
      const card = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.22, 0.02), material);
      card.position.set(
        -4 + (index % 7) * 1.28,
        1.5 + Math.sin(index) * 0.75,
        -1.4 - Math.floor(index / 7) * 0.28,
      );
      card.rotation.set(Math.sin(index) * 0.4, Math.cos(index) * 0.3, index * 0.2);
      scene.add(card);
      return card;
    });

    let frameId = 0;
    const resize = () => {
      const parent = canvas.parentElement;
      const width = parent?.clientWidth ?? window.innerWidth;
      const height = parent?.clientHeight ?? window.innerHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
    };

    const animate = () => {
      const elapsed = window.performance.now() / 1000;
      const progress = progressRef.current;
      const arrive = smoothStep(0.08, 0.33, progress);
      const connect = smoothStep(0.34, 0.58, progress);
      const map = smoothStep(0.56, 0.78, progress);
      const future = smoothStep(0.76, 1, progress);

      caravan.position.x = -3.8 + arrive * 3.55 + future * 0.35;
      caravan.position.y = Math.sin(elapsed * 1.4) * 0.035;
      caravan.position.z = -future * 0.55;
      caravan.rotation.y = -0.22 + connect * 0.38 - future * 0.22;
      caravan.rotation.z = Math.sin(elapsed * 1.1) * 0.015;

      characters.forEach((character, index) => {
        const targetX = -0.78 + index * 0.78;
        const lonelyX = -2.6 + index * 2.55;
        character.position.x = lonelyX + connect * (targetX - lonelyX);
        character.position.z = 1.65 - connect * 0.62 - future * 0.12;
        character.position.y = Math.sin(elapsed * 2.1 + index) * 0.035;
        character.rotation.y = 0.5 - connect * 0.5 + Math.sin(elapsed + index) * 0.08;
      });

      signalLines.forEach((line, index) => {
        const material = line.material as THREE.LineBasicMaterial;
        material.opacity = 0.08 + connect * 0.58 + future * 0.18;
        line.position.x = -0.12 + Math.sin(elapsed * 1.4 + index) * 0.04;
        line.scale.setScalar(0.65 + connect * 1.9 + Math.sin(elapsed * 2 + index) * 0.04);
        line.rotation.y = index * 0.24 - 0.24;
      });

      cells.forEach((cell, index) => {
        const material = cell.material;
        const pulse = (Math.sin(elapsed * 2.2 + index * 0.55) + 1) / 2;
        material.opacity = 0.08 + map * (0.24 + pulse * 0.58);
        cell.scale.y = 1 + map * (1.2 + pulse * 4.5);
      });

      noiseCards.forEach((card, index) => {
        const material = card.material as THREE.MeshStandardMaterial;
        material.opacity = 0.22 * (1 - arrive) + 0.02 * future;
        card.rotation.y += 0.002 + index * 0.00003;
        card.position.y += Math.sin(elapsed + index) * 0.0008;
      });

      teal.intensity = 2.2 + connect * 5 + future * 2;
      amber.intensity = 1.8 + arrive * 3 + future * 2.4;
      camera.position.x = -0.45 + progress * 0.95;
      camera.position.y = 2.25 - connect * 0.28 + future * 0.18;
      camera.position.z = 7.4 - progress * 1.85;
      camera.lookAt(0, 0.78, 0.2 - future * 0.6);

      renderer.render(scene, camera);
      frameId = window.requestAnimationFrame(animate);
    };

    resize();
    animate();
    window.addEventListener("resize", resize);

    return () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener("resize", resize);
      renderer.dispose();
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose();
          if (Array.isArray(object.material)) {
            object.material.forEach((material) => material.dispose());
          } else {
            object.material.dispose();
          }
        }
      });
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative min-h-[690svh] overflow-clip bg-[#060912] text-white"
      aria-label="Storia di DevRoulotte"
    >
      <div className="sticky top-0 min-h-svh overflow-hidden">
        <canvas
          ref={canvasRef}
          data-testid="landing-story-3d-canvas"
          className="absolute inset-0 h-full w-full"
          aria-hidden="true"
        />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_72%_20%,rgba(45,212,191,0.22),transparent_30%),radial-gradient(circle_at_25%_75%,rgba(245,158,11,0.16),transparent_26%),linear-gradient(90deg,rgba(6,9,18,0.96)_0%,rgba(6,9,18,0.72)_48%,rgba(6,9,18,0.18)_100%)]" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#060912] to-transparent" />

        <header className="relative z-20 mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-5 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="inline-flex min-w-0 items-center gap-3">
            <Image
              src="/devroulotte-wordmark.png"
              alt="DevRoulotte"
              width={1200}
              height={294}
              priority
              className="brand-wordmark h-auto w-40 max-w-[54vw] sm:w-56"
            />
          </Link>
          <nav className="flex items-center gap-2 text-xs font-semibold sm:text-sm">
            <ThemeToggle />
            <a
              href={WORKSHOP_FEEDBACK_URL}
              target="_blank"
              rel="noreferrer"
              data-analytics-event="workshop_form_opened"
              data-analytics-surface="landing_header"
              data-analytics-cta-id="workshop_header"
              data-analytics-destination="google_forms"
              className="hidden rounded-md border border-white/10 px-3 py-2 text-slate-200 hover:bg-white/10 hover:text-white sm:inline-flex"
            >
              In officina
            </a>
            <Link
              href="/terms"
              className="hidden rounded-md border border-white/10 px-3 py-2 text-slate-200 hover:bg-white/10 hover:text-white sm:inline-flex"
            >
              Regole
            </Link>
            <Link
              href="/chat"
              data-analytics-event="cta_clicked"
              data-analytics-surface="landing_header"
              data-analytics-cta-id="header_enter"
              data-analytics-destination="chat"
              className="inline-flex items-center gap-2 rounded-md bg-teal-300 px-3 py-2 font-bold text-slate-950 hover:bg-teal-200 sm:px-4"
            >
              Entra
              <ArrowRight className="h-4 w-4" />
            </Link>
          </nav>
        </header>

        <div className="relative z-10 mx-auto grid min-h-[calc(100svh-5.5rem)] max-w-7xl content-center gap-8 px-5 pb-12 sm:px-6 lg:px-8">
          <div className="grid max-w-4xl gap-5">
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex w-fit items-center gap-2 rounded-md border border-teal-300/25 bg-teal-300/10 px-3 py-2 text-xs font-bold uppercase text-teal-100">
                <Video className="h-4 w-4" />
                Storia interattiva
              </span>
              <RealtimeUsersBadge scope="site" surface="landing" />
            </div>
            <h1 className="max-w-4xl break-words text-4xl font-black leading-[0.94] tracking-normal text-white [overflow-wrap:anywhere] sm:text-6xl lg:text-7xl">
              Tre persone, una roulotte, cinque minuti per cambiare rotta.
            </h1>
            <p className="max-w-2xl text-base font-semibold leading-7 text-slate-200 sm:text-xl sm:leading-8">
              DevRoulotte è il superconnector casuale 1:1 per founder, builder
              e professionisti italiani che vogliono conoscersi davvero.
            </p>
            <div
              className="pointer-events-auto flex max-w-full gap-3 overflow-x-auto pb-2 lg:grid lg:max-w-6xl lg:grid-cols-6 lg:overflow-visible lg:pb-0"
              aria-label="Vignette interattive della storia"
            >
              {storyChapters.map(renderVignetteButton)}
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/chat"
                data-analytics-event="cta_clicked"
                data-analytics-surface="landing_story_hero"
                data-analytics-cta-id="story_enter"
                data-analytics-destination="chat"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-teal-300 px-5 text-sm font-black text-slate-950 hover:bg-teal-200"
              >
                Entra nella roulotte
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href="#storia-devroulotte"
                className="inline-flex h-12 items-center justify-center rounded-md border border-white/15 px-5 text-sm font-bold text-slate-100 hover:bg-white/10"
              >
                Scorri la storia
              </a>
            </div>
          </div>

          <div
            id="storia-devroulotte"
            className="grid max-w-xl gap-4 border-l border-teal-200/30 pl-5"
          >
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-200">
              {storyChapters[shownChapter].eyebrow}
            </p>
            <p className="text-sm font-bold text-white">
              {storyChapters[shownChapter].name} ·{" "}
              <span className="text-slate-300">{storyChapters[shownChapter].role}</span>
            </p>
          </div>
        </div>
      </div>

      <div className="pointer-events-none relative z-10 -mt-[100svh] px-5 pb-[18svh] pt-[102svh] sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-[64svh]">
          {storyChapters.map((chapter, index) => {
            const Icon = chapter.icon;

            return (
              <article
                key={chapter.title}
                ref={(node) => {
                  chapterRefs.current[index] = node;
                }}
                className={`pointer-events-auto min-h-[72svh] max-w-xl border-l pl-5 ${
                  index % 2
                    ? "ml-auto border-amber-200/40"
                    : "border-teal-200/40"
                }`}
              >
                <div className="grid gap-4 bg-[#060912]/45 py-5 backdrop-blur-sm">
                  <p className="inline-flex w-fit items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-teal-100">
                    <Icon className="h-4 w-4" />
                    {chapter.eyebrow}
                  </p>
                  <h2 className="text-3xl font-black leading-tight tracking-normal text-white sm:text-5xl">
                    {chapter.title}
                  </h2>
                  <p className="text-base font-semibold leading-7 text-slate-200 sm:text-lg sm:leading-8">
                    {chapter.body}
                  </p>
                  <p className="text-sm font-bold text-teal-100">
                    {chapter.name}{" "}
                    <span className="font-semibold text-slate-300">/ {chapter.role}</span>
                  </p>
                </div>
              </article>
            );
          })}
        </div>
      </div>

      <div className="relative z-10 border-y border-white/10 bg-[#060912]/85 px-5 py-12 backdrop-blur-md sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
          <div className="grid gap-4">
            <p className="inline-flex w-fit items-center gap-2 rounded-md border border-teal-300/25 bg-teal-300/10 px-3 py-2 text-xs font-bold uppercase text-teal-100">
              <CalendarDays className="h-4 w-4" />
              La mappa si accende
            </p>
            <h2 className="text-3xl font-black tracking-normal text-white sm:text-4xl">
              Non prenoti il futuro. Segnali quando sei disposto a incontrarlo.
            </h2>
          </div>
          <div className="grid gap-4 text-sm leading-7 text-slate-300 sm:text-base">
            <p>
              L&apos;opt-in settimanale non decide il matchmaking. Fa emergere
              i momenti in cui la roulotte è più viva: più persone indicano uno
              slot, più quel quadratino diventa intenso.
            </p>
            <p>
              Il cuore resta casuale: entri, accendi la webcam, incontri una
              persona nuova. Ma ora sai quando salire a bordo ha più possibilità
              di trasformarsi in una conversazione che lascia qualcosa.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
