"use client";

import { useState, useEffect } from "react";
import { CheckCircle } from "@phosphor-icons/react";

export default function AdminSettingsPage() {
  const [announcements, setAnnouncements] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/site-settings?key=announcements")
      .then(r => r.json())
      .then(d => {
        if (d?.value) {
          try {
            const arr = JSON.parse(d.value);
            setAnnouncements(arr.join("\n"));
          } catch {}
        }
      })
      .catch(() => {});
  }, []);

  const save = async () => {
    const arr = announcements.split("\n").map(s => s.trim()).filter(Boolean);
    await fetch("/api/site-settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: "announcements", value: JSON.stringify(arr) }),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="max-w-2xl">
      <h1 className="font-display text-2xl text-text-primary mb-8">Site Settings</h1>

      <div className="space-y-6">
        <div>
          <label className="block mb-2 font-medium text-xs uppercase tracking-widest text-text-secondary">
            Announcement Bar (one per line)
          </label>
          <textarea
            value={announcements}
            onChange={(e) => setAnnouncements(e.target.value)}
            rows={4}
            placeholder={"Free shipping over $99\nDiscreet packaging\nPremium Quality"}
            className="w-full rounded border border-border bg-brand-primary px-4 py-3 font-body text-sm text-text-primary placeholder:text-text-secondary/40 focus:outline-none focus:ring-1 focus:ring-brand-gold resize-none"
          />
          <p className="mt-1 font-body text-xs text-text-secondary/60">
            Each line = one rotating announcement. Max 3 recommended.
          </p>
        </div>

        <button
          onClick={save}
          className="flex items-center gap-2 rounded bg-brand-dark px-6 py-3 font-medium text-xs uppercase tracking-widest text-text-light transition-colors hover:bg-brand-dark/90"
        >
          {saved ? <><CheckCircle className="h-4 w-4 text-emerald-400" /> Saved</> : "Save Settings"}
        </button>
      </div>
    </div>
  );
}
