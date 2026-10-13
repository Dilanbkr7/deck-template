"use client";

import { useEffect, useRef, useState, useSyncExternalStore, type CSSProperties } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import { motion, MotionConfig } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowDown, ArrowUpRight, Braces, Globe2, Network, Pause, Play, Sparkles } from "lucide-react";
import InteractiveTitle from "../cinematic/InteractiveTitle";
import MagneticLink from "../cinematic/MagneticLink";
import { SCENES, TOTAL_TRAVEL, TRANSITION_HALF, sceneAt, sceneProgress } from "./scenes";
import type { DepthRuntime } from "./DepthAtmosphere";
import styles from "./ParallaxHero.module.css";
import { SITE } from "@/config/site";

const DepthAtmosphere = dynamic(() => import("./DepthAtmosphere"), { ssr: false });
const EnergyPortal = dynamic(() => import("../portal/EnergyPortal"), { ssr: false });
const orbTilts = [{ x: 9, y: -16 }, { x: -12, y: 24 }, { x: 15, y: -22 }];
const icons = { web: Globe2, network: Network, code: Braces };
const motionQuery = "(prefers-reduced-motion: reduce)";
const reducedSnapshot = () => window.matchMedia(motionQuery).matches;
const serverSnapshot = () => false;
function subscribeReduced(notify: () => void) {
  const media = window.matchMedia(motionQuery);
  media.addEventListener("change", notify);
  return () => media.removeEventListener("change", notify);
}

export default function LayeredHero() {
  const host = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLElement>(null);
  const progressBar = useRef<HTMLDivElement>(null);
  const figures = useRef<(HTMLDivElement | null)[]>([]);
  const runtime = useRef<DepthRuntime>({ x: 0, y: 0, progress: 0, active: true });
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const [visible, setVisible] = useState(true);
  const reduced = useSyncExternalStore(subscribeReduced, reducedSnapshot, serverSnapshot);

  useEffect(() => {
    const element = stage.current;
    if (!element) return;
    let inView = true;
    const sync = () => setVisible(inView && !document.hidden);
    const observer = new IntersectionObserver(([entry]) => { inView = entry.isIntersecting; sync(); });
    observer.observe(element);
    document.addEventListener("visibilitychange", sync);
    return () => { observer.disconnect(); document.removeEventListener("visibilitychange", sync); };
  }, []);

  useEffect(() => { runtime.current.active = visible && !paused && !reduced; }, [visible, paused, reduced]);

  useEffect(() => {
    const element = stage.current;
    if (!element || reduced) return;
    gsap.registerPlugin(ScrollTrigger);
    const context = gsap.context(() => {
      const scenes = gsap.utils.toArray<HTMLElement>("[data-art-scene]", element);
      const media = gsap.matchMedia();
      media.add({ small: "(max-width: 760px)", large: "(min-width: 761px)" }, ({ conditions }) => {
        const small = conditions?.small;
        const sequence = gsap.timeline({ paused: true });
        sequence.fromTo(`.${styles.depthTravel}`, { scale: 1, yPercent: 0 }, { scale: 1.3, yPercent: -5, duration: TOTAL_TRAVEL, ease: "none" }, 0);
        sequence.fromTo(`.${styles.floorTravel}`, { yPercent: 0 }, { yPercent: 18, duration: TOTAL_TRAVEL, ease: "none" }, 0);
        scenes.forEach((scene, index) => {
          const start = Math.max(0, index - TRANSITION_HALF);
          const direction = SCENES[index].side === "right" ? 1 : -1;
          sequence.fromTo(scene.querySelector(`.${styles.visual}`),
            { xPercent: small ? 0 : direction * 9, yPercent: 4, scale: 0.93 },
            { xPercent: small ? 0 : direction * -3, yPercent: -3, scale: 1.035, duration: Math.min(1.44, TOTAL_TRAVEL - start), ease: "none" }, start);
          sequence.fromTo(scene.querySelector(`.${styles.backword}`), { xPercent: direction * 3 }, { xPercent: direction * -4, duration: Math.min(1.44, TOTAL_TRAVEL - start), ease: "none" }, start);
        });
        for (let i = 1; i < scenes.length; i++) {
          const start = i - TRANSITION_HALF;
          const duration = TRANSITION_HALF * 2;
          sequence.to(scenes[i - 1], { opacity: 0, duration, ease: "power2.inOut" }, start);
          sequence.fromTo(scenes[i], { opacity: 0 }, { opacity: 1, duration, ease: "power2.inOut" }, start);
          sequence.to(scenes[i - 1].querySelector(`.${styles.copy}`), { y: -32, filter: "blur(6px)", opacity: 0, duration: 0.24 }, start);
          sequence.fromTo(scenes[i].querySelector(`.${styles.copy}`), { y: 35, filter: "blur(8px)", opacity: 0 }, { y: 0, filter: "blur(0px)", opacity: 1, duration: 0.3, ease: "power3.out" }, start + 0.14);
        }
        const playhead = { progress: 0 };
        const renderProgress = (p: number) => {
          runtime.current.progress = p;
          sequence.time(p * TOTAL_TRAVEL);
          if (progressBar.current) progressBar.current.style.transform = `scaleX(${p})`;
          setCurrent(previous => { const next = sceneAt(p); return previous === next ? previous : next; });
        };
        gsap.fromTo(playhead, { progress: 0 }, { progress: 1, ease: "none", scrollTrigger: {
          id: "deck-layered-story", trigger: element, start: "top top", end: () => `+=${window.innerHeight * TOTAL_TRAVEL}`,
          pin: true, scrub: 0.65, invalidateOnRefresh: true,
          onRefresh: self => { playhead.progress = self.progress; renderProgress(self.progress); },
        }, onUpdate: () => renderProgress(playhead.progress) });
      });
      const restore = () => ScrollTrigger.refresh();
      window.addEventListener("pageshow", restore);
      const frame = requestAnimationFrame(restore);
      return () => { media.revert(); window.removeEventListener("pageshow", restore); cancelAnimationFrame(frame); };
    }, host);
    return () => context.revert();
  }, [reduced]);

  function goTo(index: number) {
    if (reduced) {
      host.current?.querySelector(`[data-art-scene="${index}"]`)?.scrollIntoView({ behavior: "instant", block: "start" });
      return;
    }
    const trigger = ScrollTrigger.getById("deck-layered-story");
    if (trigger) window.scrollTo({ top: trigger.start + (trigger.end - trigger.start) * sceneProgress(index), behavior: "smooth" });
  }

  return <MotionConfig reducedMotion="user"><div ref={host} id="inicio" className={styles.experience}>
    <a className={styles.skip} href="#sistema">Saltar la experiencia</a>
    <section ref={stage} id="hero" className={styles.stage} aria-label={`${SITE.name}: diseño web y sistemas a medida en tres escenas`}
      data-scene={current} data-reduced={reduced} data-rest={paused || !visible}
      style={{ "--accent": SCENES[current].accent, "--accent-rgb": SCENES[current].rgb } as CSSProperties}
      onPointerMove={event => {
        if (reduced || paused || event.pointerType !== "mouse") return;
        const rect = event.currentTarget.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width * 2 - 1;
        const y = (event.clientY - rect.top) / rect.height * 2 - 1;
        runtime.current.x = x; runtime.current.y = y;
        event.currentTarget.style.setProperty("--px", `${x}`);
        event.currentTarget.style.setProperty("--py", `${y}`);
      }} onPointerLeave={() => {
        runtime.current.x = 0; runtime.current.y = 0;
        stage.current?.style.setProperty("--px", "0"); stage.current?.style.setProperty("--py", "0");
      }}>
      <div className={styles.world} aria-hidden="true">
        <div className={styles.nebula} />
        <div className={styles.depthTravel}><div className={styles.architecture}>
          {[0, 1, 2, 3, 4].map(i => <div key={i} className={styles.portalFrame} style={{ "--depth": i } as CSSProperties}><i /><b /></div>)}
        </div></div>
        <div className={styles.floorTravel}><div className={styles.floor} /></div>
        <div className={styles.horizon} /><div className={styles.lightBeam} /><div className={styles.vignette} />
      </div>
      <header className={styles.header}>
        <a href="#inicio" className={styles.logo} aria-label={`${SITE.name}, inicio`}>{SITE.name}<span>®</span><small>{SITE.studio[0]}<br />{SITE.studio[1]}</small></a>
        <nav aria-label="Navegación principal"><a href="#sistema">Qué hacemos</a><a href="#metodo">Nuestra forma</a></nav>
        <MagneticLink href="#contacto" paused={paused} className={styles.headerCta}>Hablemos <ArrowUpRight size={16} /></MagneticLink>
      </header>
      <div className={styles.topline}><span><i /> DISEÑO CON CARÁCTER. CÓDIGO CON PROPÓSITO.</span><span>{SITE.location}</span></div>
      <div className={styles.sceneStack}>
        {SCENES.map((scene, index) => {
          const Icon = icons[scene.icon];
          const active = reduced || current === index;
          return <article key={scene.id} className={styles.scene} data-art-scene={index} data-side={scene.side} data-active={active} aria-hidden={!active} inert={!active}
            style={{ "--tone": scene.accent, "--tone-rgb": scene.rgb } as CSSProperties}>
            <div className={styles.backword} aria-hidden="true">{scene.word}</div>
            <div className={styles.visual}><div className={styles.figureTravel} ref={node => { figures.current[index] = node; }}>
              <div className={styles.orbShell} aria-hidden="true">
                <div className={styles.orbAura} />
                <EnergyPortal tiltX={orbTilts[index].x} tiltY={orbTilts[index].y}
                  paused={paused || !visible || reduced || current !== index} />
              </div>
              <div className={styles.plinth} aria-hidden="true" />
              <div className={styles.figure} onPointerMove={event => {
                if (reduced || paused || event.pointerType !== "mouse") return;
                const rect = event.currentTarget.getBoundingClientRect();
                event.currentTarget.style.setProperty("--lens-x", `${event.clientX - rect.left}px`);
                event.currentTarget.style.setProperty("--lens-y", `${event.clientY - rect.top}px`);
                event.currentTarget.style.setProperty("--lens-on", "1");
              }} onPointerLeave={event => event.currentTarget.style.setProperty("--lens-on", "0")}>
                <Image src={`/media/hero-character/${scene.image}.webp`} alt={scene.alt} fill sizes="(max-width: 760px) 85vw, 48vw" loading="eager" fetchPriority={index === 0 ? "high" : "auto"} className={styles.sculpture} />
                <div className={styles.refraction} aria-hidden="true"><Image src={`/media/hero-character/${scene.image}.webp`} alt="" fill sizes="(max-width: 760px) 85vw, 48vw" loading="eager" className={styles.sculpture} /></div>
              </div>
              <div className={styles.coordinate} aria-hidden="true"><span /> FIG. 0{index + 1}<small>{scene.caption}</small></div>
            </div></div>
            <div className={styles.copy}>
              <p className={styles.eyebrow}><span>0{index + 1}</span>{scene.kicker}</p>
              <InteractiveTitle as={index === 0 ? "h1" : "h2"} lines={scene.title} effect={scene.effect} className={styles.title} paused={paused} />
              <p className={styles.description}>{scene.description}</p>
              {index === SCENES.length - 1 ? <MagneticLink href="#contacto" paused={paused} className={styles.mainCta}>{scene.cta}<ArrowUpRight size={18} /></MagneticLink>
                : <button className={styles.mainCta} onClick={() => goTo(index + 1)}>{scene.cta}<ArrowDown size={18} /></button>}
              <div className={styles.discipline}><Icon size={16} strokeWidth={1.4} /><span>{scene.tag}</span><i /><span>HECHO PARA TI</span></div>
            </div>
          </article>;
        })}
      </div>
      {!reduced && <div className={styles.dust} aria-hidden="true"><DepthAtmosphere runtime={runtime} anchors={figures} active={visible && !paused} /></div>}
      <div className={styles.grain} aria-hidden="true" />
      <aside className={styles.sideRail} aria-hidden="true"><span>SCROLL TO DISCOVER</span><i /><span>0{current + 1} / 0{SCENES.length}</span></aside>
      <footer className={styles.footer}>
        <div className={styles.scrollCue}><span><ArrowDown size={17} /></span><p>TU PRÓXIMA DIMENSIÓN.<small>Tres escenas. Infinitas posibilidades.</small></p></div>
        <nav className={styles.chapters} aria-label="Escenas del recorrido">{SCENES.map((scene, index) => <button key={scene.id} onClick={() => goTo(index)} aria-label={`Ver escena ${index + 1}: ${scene.label}`} aria-current={current === index ? "step" : undefined}><span>0{index + 1}</span><i /><small>{scene.label}</small></button>)}</nav>
        <button className={styles.pause} onClick={() => setPaused(value => !value)} aria-label={paused ? "Activar efectos ambientales" : "Pausar efectos ambientales"} aria-pressed={paused}>{paused ? <Play size={14} /> : <Pause size={14} />}<span>AMBIENTE</span></button>
      </footer>
      <div className={styles.progress} aria-hidden="true"><div ref={progressBar} /></div>
    </section>
    <motion.div className={styles.signature} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}><span>DISEÑO QUE SE SIENTE.</span><Sparkles size={24} strokeWidth={1} /><span>TECNOLOGÍA QUE FUNCIONA.</span><em>Hecho a tu medida.</em></motion.div>
  </div></MotionConfig>;
}
