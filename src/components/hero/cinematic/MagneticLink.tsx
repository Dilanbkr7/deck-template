"use client";

import { motion, useMotionValue, useSpring, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

export default function MagneticLink({ href, className, children, paused = false }: { href: string; className?: string; children: ReactNode; paused?: boolean }) {
  const reduced = useReducedMotion();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 240, damping: 22 });
  const sy = useSpring(y, { stiffness: 240, damping: 22 });
  return <motion.a href={href} className={className} style={{ x: paused || reduced ? 0 : sx, y: paused || reduced ? 0 : sy }}
    onPointerMove={event => {
      if (reduced || paused || event.pointerType !== "mouse") return;
      const rect = event.currentTarget.getBoundingClientRect();
      x.set((event.clientX - rect.left - rect.width / 2) * 0.08);
      y.set((event.clientY - rect.top - rect.height / 2) * 0.12);
    }} onPointerLeave={() => { x.set(0); y.set(0); }} whileTap={reduced || paused ? undefined : { scale: 0.97 }}>
    {children}
  </motion.a>;
}
