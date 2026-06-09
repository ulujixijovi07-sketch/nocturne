"use client";

import { useState, useEffect } from "react";
import { Envelope, EnvelopeOpen, Trash } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

type ContactMessage = {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  isRead: boolean;
  createdAt: string;
};

export default function AdminContactMessagesPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const fetchMessages = async () => {
    const res = await fetch("/api/admin/contact-messages");
    const data = await res.json();
    setMessages(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  useEffect(() => { fetchMessages(); }, []);

  const markRead = async (id: number) => {
    await fetch(`/api/admin/contact-messages?id=${id}`, { method: "PATCH" });
    fetchMessages();
  };

  const deleteMessage = async (id: number) => {
    if (!confirm("Delete this message?")) return;
    await fetch(`/api/admin/contact-messages?id=${id}`, { method: "DELETE" });
    fetchMessages();
  };

  if (loading) return <p className="font-body text-sm text-text-secondary">Loading...</p>;

  const unreadCount = messages.filter((m) => !m.isRead).length;

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="font-display text-2xl text-text-primary">
          Contact Messages ({messages.length})
          {unreadCount > 0 && (
            <span className="ml-2 rounded-full bg-brand-burgundy px-2 py-0.5 text-xs text-text-light">
              {unreadCount} new
            </span>
          )}
        </h1>
      </div>

      {messages.length === 0 ? (
        <p className="py-12 text-center font-body text-sm text-text-secondary">No messages yet.</p>
      ) : (
        <div className="space-y-2">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={cn(
                "rounded border bg-brand-primary transition-colors",
                msg.isRead ? "border-border" : "border-brand-gold/30 bg-brand-gold/[0.02]"
              )}
            >
              <button
                onClick={() => {
                  setExpandedId(expandedId === msg.id ? null : msg.id);
                  if (!msg.isRead) markRead(msg.id);
                }}
                className="flex w-full items-center gap-4 px-5 py-4 text-left"
              >
                {msg.isRead ? (
                  <EnvelopeOpen className="h-5 w-5 shrink-0 text-text-secondary/40" />
                ) : (
                  <Envelope className="h-5 w-5 shrink-0 text-brand-gold" />
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className={cn("font-body text-sm font-medium", msg.isRead ? "text-text-secondary" : "text-text-primary")}>
                      {msg.name}
                    </span>
                    <span className="font-body text-xs text-text-secondary/60">{msg.email}</span>
                  </div>
                  <p className="truncate font-body text-xs text-text-secondary">
                    <span className="text-text-secondary/60">{msg.subject}</span>
                    {" — "}{msg.message.substring(0, 80)}
                  </p>
                </div>
                <span className="shrink-0 font-body text-xs text-text-secondary/40">
                  {new Date(msg.createdAt).toLocaleDateString()}
                </span>
              </button>

              {expandedId === msg.id && (
                <div className="border-t border-border px-5 py-4">
                  <p className="whitespace-pre-wrap font-body text-sm text-text-secondary leading-relaxed">
                    {msg.message}
                  </p>
                  <div className="mt-4 flex gap-3">
                    <a
                      href={`mailto:${msg.email}?subject=Re: ${encodeURIComponent(msg.subject)}`}
                      className="rounded border border-border px-4 py-1.5 font-medium text-[10px] uppercase tracking-widest text-text-secondary hover:border-brand-gold hover:text-brand-gold transition-colors"
                    >
                      Reply
                    </a>
                    <button
                      onClick={() => deleteMessage(msg.id)}
                      className="flex items-center gap-1 rounded border border-border px-4 py-1.5 font-medium text-[10px] uppercase tracking-widest text-text-secondary hover:border-brand-burgundy hover:text-brand-burgundy transition-colors"
                    >
                      <Trash className="h-3 w-3" />
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
