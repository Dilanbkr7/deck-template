// EDITA AQUÍ los textos debajo del hero y el destino de contacto.
import { SITE } from "@/config/site";
export const SITE_COPY = {
  system: {
    eyebrow: "01 / CONSTRUIMOS CON INTENCIÓN",
    lines: ["UNA WEB ES EL INICIO.", "EL SISTEMA LO CAMBIA TODO."],
    description: "Tu marca atrae. Tu tecnología conecta. Tu equipo avanza. Diseñamos cada pieza para que todo trabaje en la misma dirección.",
  },
  services: [
    { number: "01", title: "Experiencias que atraen.", label: "WEB & EXPERIENCIA", description: "Presencia digital con carácter. Sitios que cuentan tu historia y convierten el interés en una acción.", icon: "↗" },
    { number: "02", title: "Procesos que fluyen.", label: "CRM & AUTOMATIZACIÓN", description: "Menos tareas repetidas, más oportunidades atendidas. Herramientas conectadas a la forma en que operas.", icon: "↔" },
    { number: "03", title: "Tecnología que te pertenece.", label: "SOFTWARE A MEDIDA", description: "Un sistema diseñado alrededor de tu negocio, capaz de evolucionar junto a tus próximos retos.", icon: "⌘" },
  ],
  method: {
    eyebrow: "02 / CONECTAR PARA CRECER",
    lines: ["DEL PRIMER CLIC.", "A TU PRÓXIMO CLIENTE."],
    description: "Diseñamos el recorrido completo. Desde lo que tu cliente ve hasta lo que tu equipo necesita para responder.",
    steps: ["Atraer", "Conectar", "Automatizar", "Crecer"],
  },
  contact: {
    eyebrow: "EL SIGUIENTE PORTAL ES TUYO",
    lines: ["¿QUÉ QUIERES", "HACER POSIBLE?"],
    description: "Una idea, un proceso que mejorar o un sistema por construir. Empecemos por tu negocio.",
    cta: SITE.contactLabel,
    href: SITE.contactUrl,
  },
} as const;
