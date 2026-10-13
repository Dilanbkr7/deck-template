"use client";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import InteractiveTitle from "./InteractiveTitle";
import MagneticLink from "./MagneticLink";
import { SITE } from "@/config/site";
import { SITE_COPY } from "./siteCopy";
import styles from "./Cinema.module.css";
export default function StudioContent() {
  const reduced = useReducedMotion();
  return <div className={styles.experience}>
    <section id="sistema" className={styles.systemSection}>
      <div className={styles.sectionLead}><p className={styles.eyebrow}>{SITE_COPY.system.eyebrow}</p><InteractiveTitle lines={SITE_COPY.system.lines} effect="prism" /><p>{SITE_COPY.system.description}</p></div>
      <div className={styles.services}>{SITE_COPY.services.map(({ number, title, label, description, icon }) => <motion.article key={number} initial={reduced ? false : { opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.15 }} transition={{ duration: 0.65 }}><div className={styles.serviceTop}><span>{number} /</span><span className={styles.serviceIcon}>{icon}</span></div><p className={styles.serviceLabel}>{label}</p><h3>{title}</h3><p>{description}</p><a href="#contacto">Hablemos de tu proyecto <ArrowUpRight size={15} /></a></motion.article>)}</div>
    </section>

    <section id="metodo" className={styles.method}><p className={styles.eyebrow}>{SITE_COPY.method.eyebrow}</p><div><InteractiveTitle lines={SITE_COPY.method.lines} effect="wave" /><p>{SITE_COPY.method.description}</p></div><ol className={styles.flow}>{SITE_COPY.method.steps.map((word, index) => <li key={word}><span>0{index + 1}</span><strong>{word}</strong>{index < 3 && <ArrowRight size={20} />}</li>)}</ol></section>

    <section id="contacto" className={styles.contact}><p className={styles.eyebrow}><span />{SITE_COPY.contact.eyebrow}</p><InteractiveTitle lines={SITE_COPY.contact.lines} effect="focus" /><p>{SITE_COPY.contact.description}</p><MagneticLink href={SITE_COPY.contact.href} className={styles.contactCta}>{SITE_COPY.contact.cta} <ArrowUpRight size={24} /></MagneticLink><div className={styles.endline}><a href="#inicio" className={styles.brand}>{SITE.name}<span>®</span></a><span>YOUR BUSINESS. YOUR SYSTEM.</span><a href="#inicio">VOLVER AL INICIO ↑</a></div></section>

</div>;
}
