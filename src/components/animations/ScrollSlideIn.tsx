"use client";
import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

interface ScrollSlideInProps {
  direction: "left" | "right";
  children: React.ReactNode;
  className?: string;
}

export function ScrollSlideIn({ direction, children, className }: ScrollSlideInProps) {
  const ref = useRef<HTMLDivElement>(null);
  
  // Dramatic offset for the entrance
  const xOffset = direction === "left" ? -400 : 400;

  useGSAP(() => {
    const el = ref.current;
    if (!el) return;

    gsap.set(el, { x: xOffset, autoAlpha: 0 });

    ScrollTrigger.create({
      trigger: el,
      start: "top 85%", // Trigger when top of element hits 85% of viewport from top
      end: "top 15%",
      onEnter: () => gsap.to(el, { x: 0, autoAlpha: 1, duration: 0.8, ease: "power3.out" }),
      onLeave: () => gsap.to(el, { x: -xOffset, autoAlpha: 0, duration: 0.6, ease: "power3.in" }),
      onEnterBack: () => gsap.to(el, { x: 0, autoAlpha: 1, duration: 0.8, ease: "power3.out" }),
      onLeaveBack: () => gsap.to(el, { x: xOffset, autoAlpha: 0, duration: 0.6, ease: "power3.in" }),
    });
  }, { scope: ref });

  return (
    <div ref={ref} className={className} style={{ visibility: "hidden" }}>
      {children}
    </div>
  );
}
