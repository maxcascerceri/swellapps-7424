import { useRef, type ReactNode } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { useLocation } from 'wouter';
import { ArrowUpRight } from 'lucide-react';

export const softEase = [0.22, 1, 0.36, 1] as const;

export function Reveal({ children, className = '', delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const reduced = useReducedMotion();
  return <motion.div className={className} initial={reduced ? false : { opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.25 }} transition={{ duration: .6, delay, ease: softEase }}>{children}</motion.div>;
}

export function DrawRule({ className = '' }: { className?: string }) {
  const reduced = useReducedMotion();
  return <motion.div className={`draw-rule ${className}`} initial={reduced ? false : { scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }} transition={{ duration: .85, ease: softEase }} aria-hidden="true" />;
}

export function BookingCTA({ className = '', textLink = false }: { className?: string; textLink?: boolean }) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLButtonElement>(null);
  const [, navigate] = useLocation();
  return <motion.button ref={ref} className={`${textLink ? 'text-cta' : 'book-button'} ${className}`} onClick={() => { navigate('/work-with-us'); window.scrollTo(0, 0); }}
    onPointerMove={(event) => {
      if (reduced || event.pointerType !== 'mouse' || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
      const rect = event.currentTarget.getBoundingClientRect();
      ref.current?.style.setProperty('--magnet-x', `${Math.max(-4, Math.min(4, (event.clientX - rect.left - rect.width / 2) * .05))}px`);
      ref.current?.style.setProperty('--magnet-y', `${Math.max(-4, Math.min(4, (event.clientY - rect.top - rect.height / 2) * .08))}px`);
    }}
    onPointerLeave={() => { ref.current?.style.setProperty('--magnet-x', '0px'); ref.current?.style.setProperty('--magnet-y', '0px'); }}
    whileTap={reduced ? undefined : { scale: .98 }} transition={{ duration: .2, ease: softEase }}>
    <span>Get in Touch</span><ArrowUpRight size={textLink ? 34 : 19} strokeWidth={1.7} aria-hidden="true" />
    {textLink && <svg className="text-cta-line" viewBox="0 0 270 13" preserveAspectRatio="none" aria-hidden="true"><path d="M2 10Q113 1 268 5" /></svg>}
  </motion.button>;
}
