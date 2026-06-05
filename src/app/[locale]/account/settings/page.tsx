"use client";

import { useAuth } from "@/lib/auth-context";
import { Settings, User, Mail } from "lucide-react";

export default function SettingsPage() {
  const { user } = useAuth();

  return (
    <div className="mx-auto max-w-xl px-6 py-16 lg:px-8">
      <div className="text-center">
        <Settings className="mx-auto h-10 w-10 text-text-secondary/50" />
        <h1 className="mt-4 font-display text-3xl font-light tracking-[0.15em] text-text-primary">
          Account Settings
        </h1>
      </div>

      <div className="mt-10 space-y-5">
        {/* Name */}
        <div className="rounded-sm border border-border bg-brand-primary p-5">
          <div className="flex items-center gap-3">
            <User className="h-5 w-5 text-brand-gold" />
            <div>
              <p className="font-accent text-xs uppercase tracking-widest text-text-secondary">
                Name
              </p>
              <p className="mt-0.5 font-body text-sm text-text-primary">
                {user?.name ?? "—"}
              </p>
            </div>
          </div>
        </div>

        {/* Email */}
        <div className="rounded-sm border border-border bg-brand-primary p-5">
          <div className="flex items-center gap-3">
            <Mail className="h-5 w-5 text-brand-gold" />
            <div>
              <p className="font-accent text-xs uppercase tracking-widest text-text-secondary">
                Email
              </p>
              <p className="mt-0.5 font-body text-sm text-text-primary">
                {user?.email ?? "—"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
