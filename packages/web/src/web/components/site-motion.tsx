import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { animate, motion, useMotionValue, useReducedMotion, useTransform } from 'motion/react';
import { useLocation } from 'wouter';
import { ArrowUpRight } from 'lucide-react';
import { WORDMARK_VIEWBOX, WORDMARK_WORDS } from './wordmark-paths';

export const softEase = [0.22, 1, 0.36, 1] as const;
/** Decelerates evenly to the end, so ink edges glide into place instead of landing hard. */
export const inkEase = [0.33, 1, 0.68, 1] as const;

/**
 * The opening sequence plays once per browser session on the home page.
 * Every element it touches renders in its final state otherwise, so repeat
 * visits, client-side returns, and reduced-motion users land on a settled page.
 */
const OPENED_KEY = 'swell:opened';
let decision: boolean | undefined;
let finished = false;
function decide() {
  if (decision === undefined) {
    try {
      decision = !sessionStorage.getItem(OPENED_KEY);
      sessionStorage.setItem(OPENED_KEY, '1');
    } catch {
      decision = true;
    }
  }
  return decision;
}
export function useOpeningSequence(durationMs = 1000) {
  const reduced = useReducedMotion();
  const [play] = useState(() => decide() && !finished);
  useEffect(() => {
    if (!play) return;
    const timer = setTimeout(() => { finished = true; }, durationMs);
    return () => clearTimeout(timer);
  }, [play, durationMs]);
  return play && !reduced;
}

export function Reveal({ children, className = '', delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const reduced = useReducedMotion();
  return <motion.div className={className} initial={reduced ? false : { opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.25 }} transition={{ duration: .6, delay, ease: softEase }}>{children}</motion.div>;
}

export function DrawRule({ className = '' }: { className?: string }) {
  const reduced = useReducedMotion();
  return <motion.div className={`draw-rule ${className}`} initial={reduced ? false : { scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }} transition={{ duration: .85, ease: softEase }} aria-hidden="true" />;
}

/**
 * The wordmark as traced outlines. When `play` is set each letter is drawn
 * by a pen stroke, then inked solid; otherwise it is plain filled text.
 */
const GLYPH_STAGGER = .022;
const GLYPH_DRAW = .16;
export function Wordmark({ play = false }: { play?: boolean }) {
  const { x, y, width, height } = WORDMARK_VIEWBOX;
  let index = 0;
  return <>
    <span className="sr-only">Swell Apps</span>
    <svg className="wordmark-svg" viewBox={`${x} ${y} ${width} ${height}`} style={{ width: `${width / 1000}em`, height: `${height / 1000}em` }} aria-hidden="true" focusable="false">
      {WORDMARK_WORDS.map(word => <g key={word.text} transform={`translate(${word.offset} 0)`}>
        {word.glyphs.map(glyph => {
          const order = index++;
          const start = order * GLYPH_STAGGER;
          if (!play) return <path key={order} d={glyph.d} fill="currentColor" />;
          return <motion.path key={order} d={glyph.d} fill="currentColor" stroke="currentColor" strokeWidth={30} strokeLinecap="round" strokeLinejoin="round"
            initial={{ pathLength: 0, fillOpacity: 0, strokeOpacity: 1 }} animate={{ pathLength: 1, fillOpacity: 1, strokeOpacity: 0 }}
            transition={{ pathLength: { duration: GLYPH_DRAW, delay: start, ease: 'easeInOut' }, fillOpacity: { duration: .3, delay: start + GLYPH_DRAW - .06, ease: inkEase }, strokeOpacity: { duration: .35, delay: start + GLYPH_DRAW + .02, ease: inkEase } }} />;
        })}
      </g>)}
    </svg>
  </>;
}

/**
 * Reveals its child behind a ragged ink edge. The edge is a clip polygon with
 * a fixed hand-drawn jitter; `diagonal` tilts it so the sweep runs from the
 * top-left corner to the bottom-right. The revealed content starts a touch
 * light and soft and settles to full contrast as the edge glides home, so
 * the ink reads as soaking into the paper. The clip and filter are dropped
 * once it finishes so overflowing decorations (underline, rays, steam) are
 * never cut.
 */
const EDGE_JITTER = [1.8, -2.2, .6, 2.9, -1.4, 1.1, -2.7, 2.1, -.4, 1.6, -1.9, 2.4, -1.1];
const DIAGONAL_TILT = 55;
function wipePolygon(progress: number, direction: 'right' | 'diagonal') {
  const last = EDGE_JITTER.length - 1;
  const tilt = direction === 'diagonal' ? DIAGONAL_TILT : 0;
  const jitterScale = direction === 'diagonal' ? .7 : 1;
  const from = -10 - tilt;
  const edge = from + (112 - from) * progress;
  const points = EDGE_JITTER.map((jitter, i) => {
    const y = -25 + (150 * i) / last;
    const x = edge + tilt * (1 - i / last) + jitter * jitterScale;
    return `${x.toFixed(2)}% ${y}%`;
  });
  return `polygon(-60% -25%, ${points.join(', ')}, -60% 125%)`;
}
export function InkWipe({ as = 'div', play = false, delay = 0, duration = .4, direction = 'right', className = '', style, children }: {
  as?: 'div' | 'span'; play?: boolean; delay?: number; duration?: number; direction?: 'right' | 'diagonal'; className?: string; style?: CSSProperties; children: ReactNode;
}) {
  const Tag = as === 'span' ? motion.span : motion.div;
  const progress = useMotionValue(play ? 0 : 1);
  const clipPath = useTransform(progress, value => value >= 1 ? 'none' : wipePolygon(value, direction));
  const opacity = useTransform(progress, [0, 1], [.7, 1]);
  const filter = useTransform(progress, value => value >= 1 ? 'none' : `blur(${(1.5 * (1 - value)).toFixed(2)}px)`);
  const willChange = useTransform(progress, value => value >= 1 ? 'auto' : 'clip-path, filter, opacity');
  useEffect(() => {
    if (!play) return;
    const controls = animate(progress, 1, { delay, duration, ease: inkEase });
    return () => controls.stop();
    // The sequence is decided once per mount; timing props never change afterwards.
  }, [play]);
  return <Tag className={className} style={{ ...style, clipPath, opacity, filter, willChange }}>{children}</Tag>;
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
