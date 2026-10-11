import { useEffect, useRef, type CSSProperties } from "react";
import { motion, useMotionValue, useReducedMotion, useSpring } from "motion/react";

/**
 * Layered raster mascot. The HD master stays the drawing; only the eye dots
 * and the four steam strokes are separate full-canvas PNGs so they can move
 * without redrawing the face.
 *
 * Eye tracking: one shared spring for both dots, updated from window pointer
 * events (not React state). Tune EYE_TRAVEL (px) and EYE_SPRING.
 * Blink: CSS scale on each eye layer, origin at that pupil.
 * Steam: CSS only. Each stroke rises, sways, and fades. Tune those.
 * The body stays still so the eyes and steam read against the drawing.
 * prefers-reduced-motion leaves every layer in its original resting place.
 */

const EYE_TRAVEL = 3.6;
const EYE_REACH = 420;
const EYE_SPRING = { stiffness: 86, damping: 16, mass: 0.42 };

const STEAM: Array<{ src: string; rise: string; sway: string; duration: string; delay: string }> = [
  { src: "/images/mascot/steam-1.png", rise: "-18px", sway: "5px", duration: "5.2s", delay: "0s" },
  { src: "/images/mascot/steam-2.png", rise: "-22px", sway: "-4.5px", duration: "6s", delay: "-1.5s" },
  { src: "/images/mascot/steam-3.png", rise: "-20px", sway: "6px", duration: "5.6s", delay: "-3s" },
  { src: "/images/mascot/steam-4.png", rise: "-19px", sway: "-5px", duration: "4.8s", delay: "-4.2s" },
];

export function SwellMascot() {
  const reduced = useReducedMotion();
  const animate = reduced === false;
  const rootRef = useRef<HTMLDivElement>(null);
  const eyeX = useMotionValue(0);
  const eyeY = useMotionValue(0);
  const eyeSpringX = useSpring(eyeX, EYE_SPRING);
  const eyeSpringY = useSpring(eyeY, EYE_SPRING);

  useEffect(() => {
    const root = rootRef.current;
    if (!animate || !root) return;
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    if (!finePointer.matches) return;

    const rest = () => {
      eyeX.set(0);
      eyeY.set(0);
    };

    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      const rect = root.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const dx = event.clientX - (rect.left + rect.width * 0.56);
      const dy = event.clientY - (rect.top + rect.height * 0.33);
      const distance = Math.hypot(dx, dy) || 1;
      const reach = Math.min(1, distance / EYE_REACH);
      const size = Math.min(1.1, Math.max(0.55, rect.width / 520));
      eyeX.set((dx / distance) * EYE_TRAVEL * size * reach);
      eyeY.set((dy / distance) * EYE_TRAVEL * size * reach);
    };

    const onLeave = (event: MouseEvent) => {
      if (!event.relatedTarget) rest();
    };

    const onVisibility = () => {
      root.classList.toggle("is-paused", document.hidden);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("blur", rest);
    document.documentElement.addEventListener("mouseleave", onLeave);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("blur", rest);
      document.documentElement.removeEventListener("mouseleave", onLeave);
      document.removeEventListener("visibilitychange", onVisibility);
      root.classList.remove("is-paused");
      rest();
    };
  }, [animate, eyeX, eyeY]);

  const eyes = animate ? { x: eyeSpringX, y: eyeSpringY } : undefined;

  return (
    <div className="founder-art mascot" ref={rootRef}>
      <img
        className="mascot-base"
        src="/images/mascot/base.png"
        alt="Hand-drawn Max in a backwards cap, coffee in hand, building at his laptop."
        width={1024}
        height={759}
        fetchPriority="high"
        draggable={false}
      />
      {STEAM.map((stroke) => (
        <img
          key={stroke.src}
          className="mascot-layer mascot-steam"
          src={stroke.src}
          alt=""
          aria-hidden="true"
          draggable={false}
          style={
            {
              "--rise": stroke.rise,
              "--sway": stroke.sway,
              "--steam-duration": stroke.duration,
              "--steam-delay": stroke.delay,
            } as CSSProperties
          }
        />
      ))}
      <motion.div className="mascot-layer" style={eyes}>
        <img className="mascot-eye mascot-eye-left" src="/images/mascot/eye-left.png" alt="" aria-hidden="true" draggable={false} />
      </motion.div>
      <motion.div className="mascot-layer" style={eyes}>
        <img className="mascot-eye mascot-eye-right" src="/images/mascot/eye-right.png" alt="" aria-hidden="true" draggable={false} />
      </motion.div>
    </div>
  );
}
