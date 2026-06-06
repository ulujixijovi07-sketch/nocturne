"use client";

import { useEffect, useState } from "react";

const ANNOUNCEMENTS = [
  "Free shipping over $99",
  "Discreet packaging",
  "Premium Quality",
];

const INTERVAL = 4000; // 每条显示4秒
const TRANSITION = 800; // 过渡动画800ms

export function AnnouncementBar() {
  const [index, setIndex] = useState(0);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setExiting(true);
      setTimeout(() => {
        setIndex((prev) => (prev + 1) % ANNOUNCEMENTS.length);
        setExiting(false);
      }, TRANSITION);
    }, INTERVAL);
    return () => clearInterval(timer);
  }, []);

  const current = ANNOUNCEMENTS[index];

  return (
    <div
      className="fixed top-0 left-0 right-0 z-50 flex h-8 items-center justify-center overflow-hidden"
      style={{ backgroundColor: "var(--bg-dark)" }}
    >
      <span
        key={index}
        className="font-accent text-xs uppercase tracking-widest whitespace-nowrap"
        style={{
          color: "var(--accent-gold)",
          transform: exiting ? "translateX(120%)" : "translateX(0)",
          opacity: exiting ? 0 : 1,
          transition: `transform ${TRANSITION}ms ease-in-out, opacity ${TRANSITION}ms ease-in-out`,
        }}
      >
        {current}
      </span>
    </div>
  );
}
