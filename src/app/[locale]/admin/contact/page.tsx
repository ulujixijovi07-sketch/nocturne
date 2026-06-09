"use client";

import { useState, useEffect } from "react";
import { Envelope, EnvelopeOpen, Trash, PaperPlaneTilt } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

type ContactMessage = {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  isRead: boolean;
  reply: string | null;
  repliedAt: string | null;
  createdAt: string;
};

export default function AdminContactMessagesPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [replyText, setReplyText] = useState("");
  const [replyingId, setReplyingId] = useState<number | null>(null);
  const [sending, setSending] = useState(false);

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

  const sendReply = async (id: number) => {
    if (!replyText.trim()) return;
    setSending(true);
    const res = await fetch(`/api/admin/contact-messages?id=${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reply: replyText.trim() }),
    });
    setSending(false);
    if (res.ok) {
      setReplyText("");
      setReplyingId(null);
      fetchMessages();
    }
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
                msg.reply ? "border-border" : msg.isRead ? "border-border" : "border-brand-gold/30 bg-brand-gold/[0.02]"
              )}
            >
              <button
                onClick={() => {
                  setExpandedId(expandedId === msg.id ? null : msg.id);
                  if (!msg.isRead) markRead(msg.id);
                }}
                className="flex w-full items-center gap-4 px-5 py-4 text-left"
              >
                {msg.reply ? (
                  <PaperPlaneTilt className="h-5 w-5 shrink-0 text-emerald-500/60" />
                ) : msg.isRead ? (
                  <EnvelopeOpen className="h-5 w-5 shrink-0 text-text-secondary/40" />
                ) : (
                  <Envelope className="h-5 w-5 shrink-0 text-brand-gold" />
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className={cn("font-body text-sm font-medium", msg.reply ? "text-text-secondary" : msg.isRead ? "text-text-secondary" : "text-text-primary")}>
                      {msg.name}
                    </span>
                    <span className="font-body text-xs text-text-secondary/60">{msg.email}</span>
                  </div>
                  <p className="truncate font-body text-xs text-text-secondary">
                    <span className="text-text-secondary/60">{msg.subject}</span>
                    {" — "}{msg.message.substring(0, 80)}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  {msg.reply && (
                    <span className="rounded bg-emerald-500/10 px-1.5 py-0.5 font-medium text-[10px] text-emerald-500">
                      Replied
                    </span>
                  )}
                  <span className="font-body text-xs text-text-secondary/40">
                    {new Date(msg.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </button>

              {expandedId === msg.id && (
                <div className="border-t border-border px-5 py-4">
                  <p className="whitespace-pre-wrap font-body text-sm text-text-secondary leading-relaxed">
                    {msg.message}
                  </p>

                  {msg.reply && (
                    <div className="mt-4 rounded border border-emerald-500/20 bg-emerald-500/[0.03] p-4">
                      <p className="font-medium text-[10px] uppercase tracking-widest text-emerald-500/60">Your Reply</p>
                      <p className="mt-1 whitespace-pre-wrap font-body text-sm text-text-secondary">{msg.reply}</p>
                      <p className="mt-1 font-body text-xs text-text-secondary/40">{new Date(msg.repliedAt!).toLocaleString()}</p>
                    </div>
                  )}

                  {replyingId === msg.id ? (
                    <div className="mt-4 space-y-3">
                      <textarea
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder={`Reply to ${msg.name}...`}
                        rows={4}
                        className="w-full rounded border border-border bg-brand-secondary px-4 py-3 font-body text-sm text-text-primary placeholder:text-text-secondary/40 focus:outline-none focus:ring-1 focus:ring-brand-gold resize-none"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => sendReply(msg.id)}
                          disabled={sending || !replyText.trim()}
                          className="rounded bg-brand-gold px-6 py-2 font-medium text-xs uppercase tracking-widest text-brand-dark transition-colors hover:bg-brand-gold/90 disabled:opacity-50"
                        >
                          {sending ? "Sending..." : "Send Reply"}
                        </button>
                        <button
                          onClick={() => { setReplyingId(null); setReplyText(""); }}
                          className="rounded border border-border px-6 py-2 font-medium text-xs uppercase tracking-widest text-text-secondary hover:text-text-primary transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-4 flex gap-3">
                      {!msg.reply && (
                        <button
                          onClick={() => { setReplyingId(msg.id); setReplyText(""); }}
                          className="rounded border border-border px-4 py-1.5 font-medium text-[10px] uppercase tracking-widest text-text-secondary hover:border-brand-gold hover:text-brand-gold transition-colors"
                        >
                          Reply
                        </button>
                      )}
                      <button
                        onClick={() => deleteMessage(msg.id)}
                        className="flex items-center gap-1 rounded border border-border px-4 py-1.5 font-medium text-[10px] uppercase tracking-widest text-text-secondary hover:border-brand-burgundy hover:text-brand-burgundy transition-colors"
                      >
                        <Trash className="h-3 w-3" />
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
