"use client";

import { useState, useEffect } from "react";
import { Envelope, PaperPlaneTilt, Users } from "@phosphor-icons/react";

type Subscriber = { id: string; email: string; name: string | null; createdAt: string };

export default function AdminNewsletterPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/newsletter/subscribers")
      .then((r) => r.json())
      .then((d) => setSubscribers(d.subscribers || []))
      .finally(() => setLoading(false));
  }, []);

  const handleSend = async (testMode: boolean) => {
    if (!subject.trim() || !body.trim()) return;
    setSending(true);
    setResult(null);
    try {
      const res = await fetch("/api/admin/newsletter/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject: subject.trim(), html: body, testMode }),
      });
      const data = await res.json();
      if (res.ok) {
        setResult(testMode
          ? `Test sent to ${data.testEmail}. ${data.total} total subscribers.`
          : `Sent to ${data.sent} of ${data.total} subscribers.`);
        if (!testMode) { setSubject(""); setBody(""); }
      } else {
        setResult(`Error: ${data.error}`);
      }
    } catch {
      setResult("Failed to send.");
    }
    setSending(false);
  };

  const previewHtml = body
    ? `<div style="max-width:600px;margin:0 auto;font-family:Georgia,serif;background:#1A1817;color:#F6F2ED;padding:40px">
<h1 style="font-weight:300;letter-spacing:0.2em;text-align:center;color:#C9A96E">NOCTURNE</h1>
${body}
<p style="font-size:11px;color:#5A524A;text-align:center;margin-top:40px;border-top:1px solid #3D3530;padding-top:20px">© NOCTURNE · <a href="%unsubscribe_url%" style="color:#5A524A">Unsubscribe</a></p>
</div>`
    : "";

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <div className="flex items-center gap-3 mb-8">
        <Envelope className="h-6 w-6 text-brand-gold" />
        <h1 className="font-display text-2xl font-light tracking-[0.1em] text-text-primary">Newsletter</h1>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Compose */}
        <div className="space-y-4">
          <h2 className="font-medium text-xs uppercase tracking-widest text-text-secondary">Compose</h2>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Subject line"
            className="w-full rounded border border-border bg-transparent px-3 py-2.5 font-body text-sm text-text-primary placeholder:text-text-secondary/40 focus:outline-none focus:ring-1 focus:ring-brand-gold"
          />
          <textarea
            rows={10}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder={`<p style="text-align:center;font-size:14px;color:#A69D94">Write your newsletter content in HTML…</p>`}
            className="w-full rounded border border-border bg-transparent px-3 py-2.5 font-mono text-xs text-text-primary placeholder:text-text-secondary/40 focus:outline-none focus:ring-1 focus:ring-brand-gold resize-none"
          />
          <div className="flex gap-2">
            <button
              onClick={() => handleSend(true)}
              disabled={sending || !subject.trim() || !body.trim()}
              className="flex-1 rounded bg-brand-dark py-2.5 font-medium text-[11px] uppercase tracking-widest text-text-light hover:bg-brand-dark/90 disabled:opacity-50"
            >
              Send Test
            </button>
            <button
              onClick={() => handleSend(false)}
              disabled={sending || !subject.trim() || !body.trim()}
              className="flex-1 rounded bg-brand-gold py-2.5 font-medium text-[11px] uppercase tracking-widest text-brand-dark hover:bg-brand-gold/80 disabled:opacity-50"
            >
              {sending ? "Sending…" : "Send to All"}
            </button>
          </div>
          {result && <p className="font-body text-xs text-brand-gold">{result}</p>}
        </div>

        {/* Preview + Subscribers */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-medium text-xs uppercase tracking-widest text-text-secondary">Preview</h2>
            <span className="flex items-center gap-1 font-body text-xs text-text-secondary">
              <Users className="h-3 w-3" />
              {loading ? "…" : subscribers.length} subscribers
            </span>
          </div>
          {previewHtml ? (
            <div
              className="rounded border border-border bg-white text-black overflow-auto max-h-96"
              dangerouslySetInnerHTML={{ __html: previewHtml }}
            />
          ) : (
            <div className="rounded border border-border bg-brand-primary p-8 text-center font-body text-sm text-text-secondary">
              Write content to see preview
            </div>
          )}

          {/* Subscriber list */}
          <details className="group rounded border border-border bg-brand-primary">
            <summary className="flex cursor-pointer items-center gap-2 px-4 py-3 marker:hidden font-medium text-[10px] uppercase tracking-widest text-text-secondary hover:text-text-primary">
              <PaperPlaneTilt className="h-3 w-3" />
              Subscriber List ({subscribers.length})
            </summary>
            <div className="border-t border-border max-h-48 overflow-y-auto px-4 py-2">
              {subscribers.map((s) => (
                <div key={s.id} className="flex justify-between py-1.5 text-xs text-text-secondary border-b border-border/30 last:border-0">
                  <span>{s.email}</span>
                  <span className="text-text-secondary/50">{new Date(s.createdAt).toLocaleDateString()}</span>
                </div>
              ))}
            </div>
          </details>
        </div>
      </div>
    </div>
  );
}
