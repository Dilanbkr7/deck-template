"use client";

import { useEffect, useRef } from "react";
import styles from "./EnergyPortal.module.css";

type Props = { tiltX?: number; tiltY?: number; paused?: boolean };

// Original procedural artwork: projected rings, interference and traveling light.
// Canvas 2D deliberately avoids allocating an extra WebGL context per scene.
export default function EnergyPortal({ tiltX = 9, tiltY = -16, paused = false }: Props) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const elapsed = useRef(0);

  useEffect(() => {
    const surface = canvas.current;
    const context = surface?.getContext("2d", { alpha: true });
    if (!surface || !context) return;
    const host = surface.closest("section") ?? surface;
    let size = 0;
    let frame = 0;
    let previous = 0;
    let inView = true;
    let disposed = false;
    let mouseX = 0;
    let mouseY = 0;
    let leanX = 0;
    let leanY = 0;
    const tau = Math.PI * 2;

    function draw() {
      if (!context || !size) return;
      const t = elapsed.current;
      context.clearRect(0, 0, size, size);
      context.globalCompositeOperation = "screen";
      const rx = (tiltX + leanY * 12 + Math.sin(t * 0.3) * 6) * Math.PI / 180;
      const ry = (tiltY + leanX * 16 + Math.cos(t * 0.22) * 7) * Math.PI / 180;
      const radius = size * 0.405;
      const point = (angle: number, ribbon: number) => {
        const interference = Math.sin(angle * 7 + t * 0.65 + ribbon) * 0.006
          + Math.sin(angle * 13 - t * 0.9) * 0.003;
        const r = radius * (1 + interference + ribbon * 0.009);
        const x = Math.cos(angle) * r;
        const y = Math.sin(angle) * r;
        const z = y * Math.sin(rx);
        const rotatedX = x * Math.cos(ry) + z * Math.sin(ry);
        const depth = -x * Math.sin(ry) + z * Math.cos(ry);
        const perspective = size * 2.8 / (size * 2.8 + depth);
        return [size / 2 + rotatedX * perspective, size / 2 + y * Math.cos(rx) * perspective];
      };
      const trace = (ribbon: number, start = 0, length = tau) => {
        context.beginPath();
        const segments = Math.ceil(180 * length / tau);
        for (let i = 0; i <= segments; i++) {
          const [x, y] = point(start + length * i / segments, ribbon);
          if (i === 0) context.moveTo(x, y); else context.lineTo(x, y);
        }
      };
      const gradient = context.createLinearGradient(size * 0.1, size * 0.8, size * 0.92, size * 0.22);
      gradient.addColorStop(0, "#7d32ef");
      gradient.addColorStop(0.4, "#b66dff");
      gradient.addColorStop(0.74, "#67cdef");
      gradient.addColorStop(1, "#555edc");
      context.strokeStyle = gradient;
      context.lineCap = "round";
      trace(0);
      context.globalAlpha = 0.1;
      context.lineWidth = size * 0.045;
      context.shadowBlur = size * 0.045;
      context.shadowColor = "#9158ff";
      context.stroke();
      context.globalAlpha = 0.4;
      context.lineWidth = size * 0.012;
      context.stroke();
      context.shadowBlur = 0;
      for (let i = -2; i <= 2; i++) {
        trace(i);
        context.lineWidth = size * (i === 0 ? 0.003 : 0.0012);
        context.globalAlpha = i === 0 ? 0.85 : 0.35;
        context.stroke();
      }
      for (let i = 0; i < 3; i++) {
        trace(0, t * 0.25 + i * tau / 3, 0.42);
        context.lineWidth = size * 0.0035;
        context.strokeStyle = i === 1 ? "#c3f8ff" : "#f1daff";
        context.globalAlpha = 0.7;
        context.shadowColor = i === 1 ? "#4cc2e9" : "#b273ff";
        context.shadowBlur = size * 0.02;
        context.stroke();
      }
      context.globalAlpha = 1;
      context.shadowBlur = 0;
    }

    function tick(now: number) {
      frame = 0;
      if (disposed || paused || document.hidden || !inView) return;
      const delta = previous ? Math.min((now - previous) / 1000, 0.05) : 0;
      previous = now;
      elapsed.current += delta;
      const smoothing = 1 - Math.exp(-delta * 4);
      leanX += (mouseX - leanX) * smoothing;
      leanY += (mouseY - leanY) * smoothing;
      draw();
      frame = requestAnimationFrame(tick);
    }
    function sync() {
      cancelAnimationFrame(frame);
      frame = 0;
      previous = 0;
      if (!disposed && !paused && !document.hidden && inView) frame = requestAnimationFrame(tick);
    }
    function resize() {
      if (!surface || !context) return;
      size = surface.getBoundingClientRect().width;
      const ratio = Math.min(window.devicePixelRatio || 1, 1.25);
      surface.width = Math.round(size * ratio);
      surface.height = Math.round(size * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      draw();
    }
    const move = (event: Event) => {
      if (paused || !(event instanceof PointerEvent) || event.pointerType !== "mouse") return;
      const bounds = host.getBoundingClientRect();
      mouseX = (event.clientX - bounds.left) / bounds.width * 2 - 1;
      mouseY = (event.clientY - bounds.top) / bounds.height * 2 - 1;
    };
    const leave = () => { mouseX = 0; mouseY = 0; };
    const resizeObserver = new ResizeObserver(resize);
    const visibility = new IntersectionObserver(([entry]) => { inView = entry.isIntersecting; sync(); });
    resizeObserver.observe(surface);
    visibility.observe(surface);
    host.addEventListener("pointermove", move, { passive: true });
    host.addEventListener("pointerleave", leave);
    document.addEventListener("visibilitychange", sync);
    resize();
    sync();
    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      visibility.disconnect();
      host.removeEventListener("pointermove", move);
      host.removeEventListener("pointerleave", leave);
      document.removeEventListener("visibilitychange", sync);
    };
  }, [paused, tiltX, tiltY]);

  return <div className={styles.portal} aria-hidden="true"><div className={styles.haze} /><canvas ref={canvas} /></div>;
}
