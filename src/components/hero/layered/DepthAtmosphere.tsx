"use client";

import { Component, useEffect, useMemo, useRef, type ReactNode, type RefObject } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Sparkles } from "@react-three/drei";
import { AdditiveBlending, Group, ShaderMaterial, Vector2 } from "three";

export type DepthRuntime = { x: number; y: number; progress: number; active: boolean };
type Anchors = RefObject<(HTMLDivElement | null)[]>;
class Boundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? null : this.props.children; }
}

const vertexShader = `
  attribute vec4 aOrbit;
  uniform float uTime;
  uniform float uDpr;
  uniform vec2 uPointer;
  varying float vLight;
  varying float vTint;
  void main() {
    float angle = aOrbit.x + uTime * (0.10 + aOrbit.w * 0.085);
    float radius = aOrbit.y + sin(uTime * 0.4 + aOrbit.x * 3.0) * 0.025;
    vec3 p = vec3(cos(angle) * radius, sin(angle) * radius * 0.96, sin(angle * 2.0 + aOrbit.x) * 0.35);
    vec2 away = p.xy - uPointer;
    p.xy += normalize(away + vec2(0.001)) * exp(-length(away) * 4.0) * 0.13;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = clamp(aOrbit.z * uDpr * (8.0 / -mv.z), 1.0, 13.0);
    vLight = (0.55 + 0.45 * sin(uTime * 0.7 + aOrbit.x * 7.0)) * mix(0.3, 1.0, smoothstep(-0.35, 0.35, p.z));
    vTint = aOrbit.w;
  }
`;
const fragmentShader = `
  uniform float uOpacity;
  varying float vLight;
  varying float vTint;
  void main() {
    float d = length(gl_PointCoord - 0.5) * 2.0;
    if (d > 1.0) discard;
    float glow = exp(-d * d * 5.0) * 0.28 + exp(-d * d * 42.0) * 0.72;
    vec3 color = mix(vec3(0.61, 0.26, 1.0), vec3(0.30, 0.76, 0.91), vTint);
    color = mix(color, vec3(0.88, 0.94, 1.0), exp(-d * d * 48.0) * 0.8);
    gl_FragColor = vec4(color, glow * vLight * uOpacity);
  }
`;

function OrbitalMotes({ runtime, anchors, index }: { runtime: RefObject<DepthRuntime>; anchors: Anchors; index: number }) {
  const group = useRef<Group>(null);
  const material = useRef<ShaderMaterial>(null);
  const elapsed = useRef(0);
  const { gl } = useThree();
  const count = useThree(state => state.size.width <= 760 ? 144 : 300);
  const particles = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const orbits = new Float32Array(count * 4);
    for (let i = 0; i < count; i++) {
      // Deterministic distribution: stable across scene changes and remounts.
      const seed = ((i * 137 + index * 43) % 997) / 997;
      orbits.set([i * 2.399963 + index * 0.8, 0.86 + seed * 0.38, i % 17 === 0 ? 11 : 3.2 + seed * 3.2, seed], i * 4);
    }
    return { count, positions, orbits };
  }, [index, count]);
  const uniforms = useMemo(() => ({ uTime: { value: 0 }, uDpr: { value: 1 }, uPointer: { value: new Vector2() }, uOpacity: { value: 0 } }), []);

  useFrame((state, delta) => {
    const target = anchors.current[index];
    const orbit = group.current;
    if (!target || !orbit || !material.current) return;
    const uniforms = material.current.uniforms;
    const article = target.closest<HTMLElement>("[data-art-scene]");
    const opacity = Number(article?.style.opacity || (index === 0 ? 1 : 0));
    orbit.visible = opacity > 0.001;
    if (!orbit.visible) return;
    const bounds = target.getBoundingClientRect();
    const canvas = gl.domElement.getBoundingClientRect();
    if (!canvas.width || !canvas.height) return;
    const world = state.viewport.getCurrentViewport(state.camera);
    const centerX = bounds.left + bounds.width / 2 - canvas.left;
    const centerY = bounds.top + bounds.height * 0.49 - canvas.top;
    const radius = bounds.height * 0.48;
    orbit.position.set((centerX / canvas.width - 0.5) * world.width, (0.5 - centerY / canvas.height) * world.height, 0);
    orbit.scale.set(radius / canvas.width * world.width, radius / canvas.height * world.height, 0.8);
    orbit.rotation.set(0.12 + index * 0.07, runtime.current.x * 0.13, index === 1 ? -0.18 : 0.10);
    if (runtime.current.active) elapsed.current += Math.min(delta, 0.04);
    uniforms.uTime.value = elapsed.current;
    uniforms.uDpr.value = gl.getPixelRatio();
    uniforms.uOpacity.value = opacity * 0.85;
    uniforms.uPointer.value.set(((runtime.current.x + 1) * canvas.width / 2 - centerX) / radius, (centerY - (runtime.current.y + 1) * canvas.height / 2) / radius);
  });

  return <group ref={group}>
    <points frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[particles.positions, 3]} />
        <bufferAttribute attach="attributes-aOrbit" args={[particles.orbits, 4]} />
      </bufferGeometry>
      <shaderMaterial ref={material} uniforms={uniforms} vertexShader={vertexShader} fragmentShader={fragmentShader} transparent depthWrite={false} blending={AdditiveBlending} />
    </points>
  </group>;
}

function Atmosphere({ runtime, anchors }: { runtime: RefObject<DepthRuntime>; anchors: Anchors }) {
  const invalidate = useThree(state => state.invalidate);
  useEffect(() => {
    // Keep the frozen particles anchored while the user scrolls with AMBIENTE paused.
    const update = () => invalidate();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, [invalidate]);
  return <>
    {[0, 1, 2].map(index => <OrbitalMotes key={index} runtime={runtime} anchors={anchors} index={index} />)}
    <Sparkles count={36} scale={[20, 12, 5]} position={[0, 0, -5]} size={1} speed={0} opacity={0.18} color="#d9ccee" />
  </>;
}

export default function DepthAtmosphere({ runtime, anchors, active }: { runtime: RefObject<DepthRuntime>; anchors: Anchors; active: boolean }) {
  return <Boundary><Canvas camera={{ position: [0, 0, 8], fov: 45 }} dpr={[1, 1.25]} frameloop={active ? "always" : "demand"}
    gl={{ alpha: true, antialias: false, preserveDrawingBuffer: true, powerPreference: "low-power" }} onCreated={({ gl }) => gl.setClearColor(0, 0)}>
    <Atmosphere runtime={runtime} anchors={anchors} />
  </Canvas></Boundary>;
}
