"use client";

import { useEffect, useState } from "react";

const DEFAULT_ANNOUNCEMENTS = [
  "Free shipping over $99",
  "Discreet packaging",
  "Premium Quality",
];

const INTERVAL = 4000;
const TRANSITION = 800;

export function AnnouncementBar() {
  const [announcements, setAnnouncements] = useState(DEFAULT_ANNOUNCEMENTS);
  const [index, setIndex] = useState(0);
  const [exiting, setExiting] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    fetch("/api/site-settings?key=announcements")
      .then(r => r.json())
      .then(d => {
        if (d?.value) {
          try {
            const parsed = JSON.parse(d.value);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setAnnouncements(parsed);
            }
          } catch {}
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (announcements.length <= 1) return;
    const timer = setInterval(() => {
      setExiting(true);
      setTimeout(() => {
        setIndex((prev) => (prev + 1) % announcements.length);
        setExiting(false);
      }, TRANSITION);
    }, INTERVAL);
    return () => clearInterval(timer);
  }, [announcements.length]);

  const current = announcements[index] || announcements[0];

  if (dismissed) return null;

  return (
    <div
      className="fixed top-0 left-0 right-0 z-50 flex h-8 items-center justify-center overflow-hidden"
      style={{ backgroundColor: "var(--bg-dark)" }}
    >
      <span
        key={index}
        className="font-medium text-xs uppercase tracking-widest whitespace-nowrap"
        style={{
          color: "var(--accent-gold)",
          transform: exiting ? "translateX(120%)" : "translateX(0)",
          opacity: exiting ? 0 : 1,
          transition: `transform ${TRANSITION}ms cubic-bezier(0.32,0.72,0,1), opacity ${TRANSITION}ms cubic-bezier(0.32,0.72,0,1)`,
        }}
      >
        {current}
      </span>
      <button
        onClick={() => setDismissed(true)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-gold/50 hover:text-brand-gold transition-colors"
        aria-label="Close announcement"
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M1 1l10 10M11 1L1 11" />
        </svg>
      </button>
    </div>
  );
}
