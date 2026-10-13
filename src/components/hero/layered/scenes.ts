export const SCENES = [
  {
    id: "web",
    label: "Tu presencia",
    word: "CREATE",
    side: "right",
    effect: "spotlight",
    kicker: "TECNOLOGÍA QUE FUNCIONA",
    title: ["Más que", "una web."],
    description:
      "Diseñamos webs que impactan y creamos sistemas a medida, adaptados a lo que tu negocio realmente necesita.",
    image: "01-frente",
    alt: "Personaje de mármol visto de frente, trabajando con su laptop",
    accent: "#c1a0ff",
    rgb: "193,160,255",
    tag: "WEB DESIGN",
    caption: "El comienzo.",
    cta: "Explora nuestras soluciones",
    icon: "web",
  },
  {
    id: "sistemas",
    label: "Todo conectado",
    word: "CONNECT",
    side: "left",
    effect: "prism",
    kicker: "TODO FLUYE. CRECE SIN LIMITES.",
    title: ["Tu negocio", "Bajo control"],
    description:
      "Transformamos procesos manuales en sistemas inteligentes que ahorran tiempo, simplifican tu operación y hacen más fácil administrar tu empresa.",
    image: "03-perfil",
    alt: "El mismo personaje de mármol de perfil, escribiendo en su laptop",
    accent: "#a5baff",
    rgb: "165,186,255",
    tag: "SISTEMAS + AUTOMATIZACIÓN",
    caption: "Cada pieza, en la misma dirección.",
    cta: "Descubre lo que sigue",
    icon: "network",
  },
  {
    id: "software",
    label: "Hecho para ti",
    word: "BEYOND",
    side: "right",
    effect: "wave",
    kicker: "TU NEGOCIO NO ES UNA PLANTILLA.",
    title: ["Tu lógica.", "Tu sistema."],
    description:
      "Desarrollamos software a medida alrededor de tu operación. Soluciones pensadas para lo que necesitas hoy y preparadas para acompañar el crecimiento de tu empresa.",
    image: "06-tres-cuartos-derecho",
    alt: "El personaje con su laptop visto desde el lado opuesto",
    accent: "#d4b3ff",
    rgb: "212,179,255",
    tag: "SOFTWARE A MEDIDA",
    caption: "Tu próxima etapa empieza aquí.",
    cta: "Hablemos de tu proyecto",
    icon: "code",
  },
] as const;

// Una unidad de timeline por capítulo, incluyendo reposo de lectura al final.
export const TOTAL_TRAVEL = SCENES.length;
export const TRANSITION_HALF = 0.22;

export function sceneAt(progress: number) {
  const safe = Number.isFinite(progress) ? Math.max(0, Math.min(1, progress)) : 0;
  return Math.min(SCENES.length - 1, Math.floor(safe * TOTAL_TRAVEL));
}

export function sceneProgress(index: number) {
  const safe = Number.isFinite(index)
    ? Math.max(0, Math.min(SCENES.length - 1, Math.floor(index)))
    : 0;

  return safe === 0 ? 0 : (safe + TRANSITION_HALF + 0.06) / TOTAL_TRAVEL;
}