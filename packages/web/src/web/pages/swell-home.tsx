import { useEffect, useRef, useState, type MouseEvent } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react';
import { SectionDoodle } from '../components/section-doodle';
import { BookingCTA, DrawRule, Reveal, softEase } from '../components/site-motion';

function InkRays({ className = '' }: { className?: string }) {
  return <svg className={`ink-rays ${className}`} viewBox="0 0 50 60" fill="none" aria-hidden="true"><path d="M10 19 22 4M18 31l22-5M17 44l16 10" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" /></svg>;
}

export default function SwellHome() {
  const reduced = useReducedMotion();
  const [compact, setCompact] = useState(false);
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
  const entrance = (delay: number) => ({ initial: reduced ? false as const : { opacity: 0, y: 14 }, animate: { opacity: 1, y: 0 }, transition: { duration: .55, delay: reduced ? 0 : delay, ease: softEase } });

  return <div className="landing" id="top">
    <header className={`header-shell ${compact ? 'is-compact' : ''}`}>
      <div className="site-header content-width">
        <a className="wordmark" href="#top" onClick={event => anchor(event, 'top')} aria-label="Swell Apps home"><strong>Swell</strong><span>Apps</span></a>
        <nav className="site-nav" aria-label="Main navigation">
          <a className="nav-link" href="#about" onClick={event => anchor(event, 'about')}>About</a>
          <a className="nav-link" href="#work" onClick={event => anchor(event, 'work')}>Work with us</a>
          <BookingCTA className="header-book" />
        </nav>
      </div>
    </header>
    <main>
      <section className="hero content-width" aria-labelledby="hero-title">
        <div className="hero-copy">
          <h1 id="hero-title">
            <motion.span className="building" {...entrance(.03)}>Building<svg className="underline" viewBox="0 0 370 20" preserveAspectRatio="none" fill="none" aria-hidden="true"><motion.path d="M3 16C112-2 235 1 366 7" stroke="currentColor" strokeWidth="4.6" strokeLinecap="round" initial={reduced ? false : { pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: .5, delay: .36, ease: softEase }} /></svg></motion.span>{' '}
            <motion.span className="collection" {...entrance(.12)}>a collection of</motion.span>{' '}
            <motion.span className="script-line" {...entrance(.25)}><InkRays className="script-rays-left" /><span className="swell-script">swell apps.</span><InkRays className="script-rays-right" /></motion.span>
          </h1>
          <motion.p className="hero-description" {...entrance(.34)}>Thoughtful products for the internet.</motion.p>
          <motion.div className="hero-action" {...entrance(.4)}><BookingCTA /><InkRays className="button-rays" /></motion.div>
        </div>
        <motion.div className="hero-art" initial={reduced ? false : { opacity: 0, y: 15, scale: .98 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: .65, delay: .2, ease: softEase }}>
          <img className="founder-art" src="/images/founder.png" alt="Hand-drawn Max in a backwards cap, coffee in hand, building at his laptop." width="760" height="564" fetchPriority="high" />
        </motion.div>
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
        <Reveal delay={.12}><p>Made by <span className="footer-max">Max</span></p></Reveal>
      </div>
    </footer>
  </div>;
}
