"use client";

import { ShareNetwork, XLogo, FacebookLogo, PinterestLogo } from "@phosphor-icons/react";

type ShareButtonsProps = {
  url: string;
  title: string;
};

export function ShareButtons({ url, title }: ShareButtonsProps) {
  const shareUrl = `https://lovenocturne.com${url}`;
  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedTitle = encodeURIComponent(title);

  const shareLinks = [
    {
      label: "Twitter",
      href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
      icon: XLogo,
    },
    {
      label: "Facebook",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      icon: FacebookLogo,
    },
    {
      label: "Pinterest",
      href: `https://pinterest.com/pin/create/button/?url=${encodedUrl}&description=${encodedTitle}`,
      icon: PinterestLogo,
    },
  ];

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title, url: shareUrl });
      } catch {}
    }
  };

  return (
    <div className="mt-8 flex items-center gap-3">
      <span className="font-medium text-[10px] uppercase tracking-widest text-text-secondary">Share</span>
      {typeof navigator !== "undefined" && typeof navigator.share === "function" && (
        <button
          onClick={handleNativeShare}
          className="flex items-center gap-1 rounded border border-border px-3 py-1.5 text-text-secondary hover:border-brand-gold hover:text-brand-gold transition-colors"
        >
          <ShareNetwork className="h-3.5 w-3.5" />
          <span className="font-medium text-[10px] uppercase tracking-wider">Share</span>
        </button>
      )}
      <div className="hidden sm:flex items-center gap-1">
        {shareLinks.map((link) => (
          <a
            key={link.label}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Share on ${link.label}`}
            className="flex items-center justify-center h-8 w-8 rounded border border-border text-text-secondary hover:border-brand-gold hover:text-brand-gold transition-colors"
          >
            <link.icon className="h-3.5 w-3.5" />
          </a>
        ))}
      </div>
    </div>
  );
}
