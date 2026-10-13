"use client";

import { useEffect, useRef, useSyncExternalStore, type PointerEvent } from "react";
import { motion } from "framer-motion";
import gsap from "gsap";
import styles from "./Cinema.module.css";

const headings = { h1: motion.h1, h2: motion.h2, h3: motion.h3 };
export type TitleEffect = "spotlight" | "prism" | "wave" | "focus";
const motionQuery = "(prefers-reduced-motion: reduce)";
const getReduced = () => window.matchMedia(motionQuery).matches;
const serverReduced = () => false;
function subscribeReduced(notify: () => void) {
  const media = window.matchMedia(motionQuery);
  media.addEventListener("change", notify);
  return () => media.removeEventListener("change", notify);
}

export default function InteractiveTitle({ lines, as = "h2", className = "", paused = false, effect = "spotlight" }: {
  lines: readonly string[]; as?: "h1" | "h2" | "h3"; className?: string; paused?: boolean; effect?: TitleEffect;
}) {
  const root = useRef<HTMLHeadingElement>(null);
  const reduced = useSyncExternalStore(subscribeReduced, getReduced, serverReduced);
  const positions = useRef<{ node: HTMLElement; x: number; y: number; height: number }[]>([]);
  const Heading = headings[as];

  const reset = () => {
    if (!root.current) return;
    root.current.style.setProperty("--text-light", "0");
    for (const { node } of positions.current) {
      node.style.setProperty("--lift", "0px");
      node.style.setProperty("--lean", "0deg");
      node.style.setProperty("--softness", "0px");
      node.style.setProperty("--shine", "0");
      node.style.setProperty("--split", "0px");
    }
  };

  useEffect(() => {
    const element = root.current;
    const glyphs = element?.querySelectorAll<HTMLElement>("[data-glyph]");
    return () => { if (glyphs) gsap.killTweensOf(glyphs); };
  }, []);

  function locate(event: PointerEvent<HTMLHeadingElement>) {
    if (reduced || paused || event.pointerType !== "mouse") return;
    const bounds = event.currentTarget.getBoundingClientRect();
    positions.current = [...event.currentTarget.querySelectorAll<HTMLElement>("[data-glyph]")].map(node => {
      const rect = node.getBoundingClientRect();
      return { node, x: rect.left - bounds.left + rect.width / 2, y: rect.top - bounds.top + rect.height / 2, height: rect.height };
    });
  }

  function illuminate(event: PointerEvent<HTMLHeadingElement>) {
    if (reduced || paused || event.pointerType !== "mouse") return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - bounds.left;
    const y = event.clientY - bounds.top;
    event.currentTarget.style.setProperty("--text-x", `${x}px`);
    event.currentTarget.style.setProperty("--text-y", `${y}px`);
    event.currentTarget.style.setProperty("--text-light", "1");
    for (const glyph of positions.current) {
      const radius = Math.max(75, glyph.height * 1.7);
      const proximity = Math.max(0, 1 - Math.hypot(x - glyph.x, (y - glyph.y) * 0.7) / radius);
      const wave = Math.sin((glyph.x - x) / radius * Math.PI);
      glyph.node.style.setProperty("--lift", `${effect === "wave" ? wave * proximity * 10 : -proximity * (effect === "focus" ? 1.5 : 4)}px`);
      glyph.node.style.setProperty("--lean", `${effect === "wave" ? wave * proximity * 5 : 0}deg`);
      glyph.node.style.setProperty("--softness", `${Math.sin(proximity * Math.PI) * (effect === "focus" ? 1.6 : 0.25)}px`);
      glyph.node.style.setProperty("--shine", String(Math.min(1, proximity * 1.65)));
      glyph.node.style.setProperty("--split", `${effect === "prism" ? proximity * 2 : 0}px`);
    }
  }

  function pulse(event: PointerEvent<HTMLHeadingElement>) {
    if (reduced || paused || event.pointerType !== "mouse") return;
    const glyphs = event.currentTarget.querySelectorAll("[data-glyph]");
    gsap.fromTo(glyphs,
      { filter: "blur(3px)", opacity: 0.65 },
      { filter: "blur(0px)", opacity: 1, duration: 0.55, stagger: { each: 0.015, from: "center" }, ease: "power2.out", overwrite: true,
        onComplete: () => { gsap.set(glyphs, { clearProps: "filter,opacity" }); } });
  }

  return <Heading ref={root} className={`${styles.interactiveTitle} ${className}`} aria-label={lines.join(" ")}
    data-interactive-title data-effect={effect} data-title-paused={paused || reduced} onPointerEnter={locate} onPointerMove={illuminate} onPointerLeave={reset} onPointerDown={pulse}
    initial={reduced ? false : "hidden"} whileInView="visible" viewport={{ once: true, amount: 0.25 }}>
    {lines.map((line, row) => <span className={styles.displayLine} key={`${row}-${line}`} aria-hidden="true">
      <motion.span className={styles.displayReveal} variants={{ hidden: { y: effect === "focus" ? "12%" : "110%", x: effect === "prism" ? "-5%" : "0%", opacity: 0, filter: `blur(${effect === "focus" ? 18 : 10}px)`, rotateX: effect === "wave" ? -28 : -12 }, visible: { y: "0%", x: "0%", opacity: 1, filter: "blur(0px)", rotateX: 0 } }}
        transition={{ duration: reduced ? 0 : 0.85, delay: reduced ? 0 : row * 0.095, ease: [0.22, 1, 0.36, 1] }}>
        {Array.from(line).map((letter, index) => <span className={styles.glyph} data-glyph data-char={letter === " " ? "\u00a0" : letter} key={index}>{letter === " " ? "\u00a0" : letter}</span>)}
      </motion.span>
    </span>)}
  </Heading>;
}
