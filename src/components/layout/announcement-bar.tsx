"use client";

import { useEffect, useRef, useState } from "react";

const ANNOUNCEMENTS = [
  "Free shipping over $99",
  "Discreet packaging",
  "Premium Quality",
];

export function AnnouncementBar() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const scrollWidth = el.scrollWidth / 2;
    let animationId: number;
    let startTime: number | null = null;

    const animate = (timestamp: number) => {
      if (startTime === null) startTime = timestamp;
      const elapsed = timestamp - startTime;
      // Rightward scroll: text enters from left, exits right
      const newOffset = (elapsed * 0.05) % scrollWidth;
      setOffset(newOffset);
      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationId);
  }, []);

  return (
    <div
      className="fixed top-0 left-0 right-0 z-50 h-8 overflow-hidden"
      style={{ backgroundColor: "var(--bg-dark)" }}
    >
      <div
        ref={scrollRef}
        className="flex h-full items-center whitespace-nowrap"
        style={{ transform: `translateX(${offset}px)` }}
      >
        {/* Render twice for seamless loop */}
        {[...ANNOUNCEMENTS, ...ANNOUNCEMENTS].map((text, i) => (
          <span
            key={i}
            className="mx-4 font-accent text-xs uppercase tracking-widest"
            style={{ color: "var(--accent-gold)" }}
          >
            {text}
          </span>
        ))}
      </div>
    </div>
  );
}
