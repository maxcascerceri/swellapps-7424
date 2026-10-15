import { useEffect, useRef, useState, type MouseEvent } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react';
import { SectionDoodle } from '../components/section-doodle';
import { BookingCTA, DrawRule, InkWipe, Reveal, Wordmark, inkEase, softEase, useOpeningSequence } from '../components/site-motion';
import { SwellMascot } from '../components/swell-mascot';

function InkRays({ className = '', play = false, delay = 0 }: { className?: string; play?: boolean; delay?: number }) {
  return <motion.svg className={`ink-rays ${className}`} viewBox="0 0 50 60" fill="none" aria-hidden="true"
    initial={play ? { opacity: 0, scale: .25, filter: 'blur(4px)' } : false} animate={play ? { opacity: 1, scale: 1, filter: 'blur(0px)' } : undefined} transition={{ type: 'spring', duration: .45, bounce: .25, delay }}>
    <path d="M10 19 22 4M18 31l22-5M17 44l16 10" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" />
  </motion.svg>;
}

/**
 * Opening beats in seconds. The page is inked in: wordmark pen-draws (0 to
 * ~.5), the three headline lines wipe in, the mascot sweeps in diagonally,
 * then the drawing wakes up (steam, a blink, eyes) while the sweep is still
 * settling and the rays spring on, so the motion trails off rather than stops.
 */
const BEATS = { building: .15, collection: .26, script: .38, underline: .36, description: .52, cta: .58, mascot: .35, mascotSweep: .6, awake: .8, rays: .76 };

export default function SwellHome() {
  const reduced = useReducedMotion();
  const play = useOpeningSequence();
  const [awake, setAwake] = useState(!play);
  const [compact, setCompact] = useState(false);
  useEffect(() => {
    if (!play) return;
    const timer = setTimeout(() => setAwake(true), BEATS.awake * 1000);
    return () => clearTimeout(timer);
  }, [play]);
  const workRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: workRef, offset: ['start end', 'end start'] });
  const doodleY = useTransform(scrollYProgress, [0, 1], [10, -10]);
  useEffect(() => {
    const scroll = () => setCompact(window.scrollY > 100);
    scroll(); window.addEventListener('scroll', scroll, { passive: true });
    return () => window.removeEventListener('scroll', scroll);
  }, []);

  const anchor = (event: MouseEvent<HTMLAnchorElement>, id: string) => {
    event.preventDefault();
    const target = document.getElementById(id);
    if (!target) return;
    const currentHeaderHeight = document.querySelector('.site-header')?.getBoundingClientRect().height ?? 78;
    const compactHeaderHeight = window.innerWidth <= 760 ? 70 : 78;
    const layoutShift = id === 'top' ? 0 : currentHeaderHeight - compactHeaderHeight;
    const destination = id === 'top' ? 0 : Math.max(0, target.getBoundingClientRect().top + window.scrollY - layoutShift - 90);
    const start = window.scrollY;
    history.replaceState(null, '', `#${id}`);
    if (reduced) { window.scrollTo(0, destination); target.focus({ preventScroll: true }); return; }
    const startTime = performance.now();
    const frame = (time: number) => {
      const progress = Math.min(1, (time - startTime) / 550);
      window.scrollTo(0, start + (destination - start) * (1 - Math.pow(1 - progress, 3)));
      if (progress < 1) requestAnimationFrame(frame);
      else { target.focus({ preventScroll: true }); }
    };
    requestAnimationFrame(frame);
  };
  const fade = (delay: number) => play ? { initial: { opacity: 0, y: 14 }, animate: { opacity: 1, y: 0 }, transition: { duration: .45, delay, ease: inkEase } } : { initial: false as const };

  return <div className="landing" id="top">
    <header className={`header-shell ${compact ? 'is-compact' : ''}`}>
      <div className="site-header content-width">
        <a className="wordmark" href="#top" onClick={event => anchor(event, 'top')} aria-label="Swell Apps home"><Wordmark play={play} /></a>
        <nav className="site-nav" aria-label="Main navigation">
          <a className="nav-link" href="#about" onClick={event => anchor(event, 'about')}>About</a>
          <BookingCTA className="header-book" />
        </nav>
      </div>
    </header>
    <main>
      <section className="hero content-width" aria-labelledby="hero-title">
        <div className="hero-copy">
          <h1 id="hero-title">
            <InkWipe as="span" className="building" play={play} delay={BEATS.building} duration={.4}>Building<svg className="underline" viewBox="0 0 370 20" preserveAspectRatio="none" fill="none" aria-hidden="true"><motion.path d="M3 16C112-2 235 1 366 7" stroke="currentColor" strokeWidth="4.6" strokeLinecap="round" initial={play ? { pathLength: 0, opacity: 0 } : false} animate={{ pathLength: 1, opacity: 1 }} transition={{ pathLength: { duration: .5, delay: BEATS.underline, ease: softEase }, opacity: { duration: .01, delay: BEATS.underline } }} /></svg></InkWipe>{' '}
            <InkWipe as="span" className="collection" play={play} delay={BEATS.collection} duration={.42}>a collection of</InkWipe>{' '}
            <InkWipe as="span" className="script-line" play={play} delay={BEATS.script} duration={.45}><InkRays className="script-rays-left" play={play} delay={BEATS.rays} /><span className="swell-script">swell apps.</span><InkRays className="script-rays-right" play={play} delay={BEATS.rays + .06} /></InkWipe>
          </h1>
          <motion.p className="hero-description" {...fade(BEATS.description)}>Thoughtful products for the internet.</motion.p>
          <motion.div className="hero-action" {...fade(BEATS.cta)}><BookingCTA /><InkRays className="button-rays" play={play} delay={BEATS.rays + .12} /></motion.div>
        </div>
        <InkWipe className="hero-art" direction="diagonal" play={play} delay={BEATS.mascot} duration={BEATS.mascotSweep}>
          <SwellMascot asleep={!awake} staged={play} />
        </InkWipe>
      </section>
      <section className="practice-strip" aria-label="Build, operate, advise">
        <DrawRule />
        <div className="practice-inner content-width">
          {[['BUILD', 'Products'], ['OPERATE', 'Apps'], ['ADVISE', 'Teams']].map(([title, subtitle], index) => <div className="practice" key={title}>
            <Reveal delay={index * .12}><h2>{title}</h2></Reveal>
            <Reveal delay={index * .12 + .08}><p>{subtitle}</p></Reveal>
          </div>)}
        </div>
        <DrawRule />
      </section>
      <section className="about-section content-width editorial-section" id="about" tabIndex={-1} aria-labelledby="about-title">
        <div className="section-heading">
          <Reveal><h2 id="about-title">About</h2></Reveal>
          <Reveal className="about-doodle" delay={.2}><SectionDoodle variant="idea" /></Reveal>
        </div>
        <div className="about-copy">
          <Reveal delay={.08}><p className="about-lead">Swell Apps is the home for the <span className="ink-highlight">products</span> we’re building.</p></Reveal>
          <Reveal delay={.18}><p className="about-detail">I’m Max — builder, operator, and occasional advisor.</p></Reveal>
        </div>
      </section>
      <section className="work-section" id="work" ref={workRef} tabIndex={-1} aria-labelledby="work-title">
        <DrawRule />
        <div className="work-inner content-width editorial-section">
          <Reveal className="section-heading advisory-heading"><span className="eyebrow">ADVISORY</span><h2 id="work-title">Work<br className="work-break" /> with us</h2></Reveal>
          <div className="work-copy">
            <Reveal delay={.1}><p>We work selectively with founders and teams on growth, product, positioning, monetization, and go-to-market strategy.</p></Reveal>
            <Reveal delay={.16}><div className="advisory-areas">
              <div><h3>Growth</h3><p>Acquisition, distribution, marketing, and monetization.</p></div>
              <div><h3>Product</h3><p>Ideas, positioning, user experience, and what to build next.</p></div>
              <div><h3>Strategy</h3><p>Go-to-market, business models, opportunities, and planning.</p></div>
            </div></Reveal>
            <Reveal delay={.2}><BookingCTA textLink /></Reveal>
          </div>
          <motion.div className="work-doodle" style={{ y: reduced ? 0 : doodleY }} aria-hidden="true"><Reveal delay={.25}><SectionDoodle variant="conversation" /></Reveal></motion.div>
        </div>
      </section>
    </main>
    <footer className="site-footer">
      <DrawRule />
      <div className="footer-inner content-width">
        <Reveal><p>Swell Apps © 2026</p></Reveal>
        <Reveal delay={.12}><p className="footer-sign">Made by <span className="footer-max">Max</span><span aria-hidden="true">·</span><a className="footer-mail" href="mailto:max@swellapps.co">max@swellapps.co</a></p></Reveal>
      </div>
    </footer>
  </div>;
}
