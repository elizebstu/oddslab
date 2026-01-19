import React from 'react';

interface LinkifyProps {
  children: string;
  className?: string;
}

/**
 * Detects and converts URLs and mentions in text to clickable links
 * Supports:
 * - HTTP/HTTPS URLs
 * - Twitter/X handles (@username)
 * - Telegram links (t.me/...)
 * - Discord links (discord.gg/...)
 */
const Linkify: React.FC<LinkifyProps> = ({ children, className = '' }) => {
  const text = children;

  // Function to get link icon based on URL pattern
  const getIcon = (url: string): React.ReactNode => {
    if (url.includes('x.com') || url.includes('twitter.com')) {
      return (
        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      );
    }
    if (url.includes('t.me') || url.includes('telegram')) {
      return (
        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
          <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
        </svg>
      );
    }
    if (url.includes('discord.gg')) {
      return (
        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
        </svg>
      );
    }
    return (
      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
      </svg>
    );
  };

  // Process text and split into parts (text and links)
  const processText = (input: string): React.ReactNode[] => {
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let match;

    // Combined regex for URLs, Telegram, Discord, and Twitter handles
    const combinedPattern = /(https?:\/\/[^\s<>"']+)|(t\.me\/[^\s<>"']+)|(discord\.gg\/[^\s<>"']+)|@(\w{1,15})\b/gi;

    while ((match = combinedPattern.exec(input)) !== null) {
      // Add text before the match
      if (match.index > lastIndex) {
        parts.push(input.substring(lastIndex, match.index));
      }

      const [, url, telegram, discord, handle] = match;
      const matchStart = match.index;
      const matchEnd = combinedPattern.lastIndex;

      // Determine the link type and href
      if (url) {
        parts.push(
          <a
            key={matchStart}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-neon-cyan hover:text-neon-purple underline underline-offset-2 decoration-neon-cyan/30 hover:decoration-neon-purple/50 transition-all"
          >
            <span className="opacity-70">{getIcon(url)}</span>
            {url.length > 50 ? url.substring(0, 50) + '...' : url}
          </a>
        );
      } else if (telegram) {
        const fullUrl = telegram.startsWith('http') ? telegram : `https://${telegram}`;
        parts.push(
          <a
            key={matchStart}
            href={fullUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-neon-cyan hover:text-neon-purple underline underline-offset-2 decoration-neon-cyan/30 hover:decoration-neon-purple/50 transition-all"
          >
            <span className="opacity-70">{getIcon(fullUrl)}</span>
            {telegram}
          </a>
        );
      } else if (discord) {
        const fullUrl = discord.startsWith('http') ? discord : `https://${discord}`;
        parts.push(
          <a
            key={matchStart}
            href={fullUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-neon-cyan hover:text-neon-purple underline underline-offset-2 decoration-neon-cyan/30 hover:decoration-neon-purple/50 transition-all"
          >
            <span className="opacity-70">{getIcon(fullUrl)}</span>
            {discord}
          </a>
        );
      } else if (handle) {
        parts.push(
          <a
            key={matchStart}
            href={`https://x.com/${handle}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-neon-cyan hover:text-neon-purple underline underline-offset-2 decoration-neon-cyan/30 hover:decoration-neon-purple/50 transition-all"
          >
            <span className="opacity-70">{getIcon('x.com')}</span>
            @{handle}
          </a>
        );
      }

      lastIndex = matchEnd;
    }

    // Add remaining text
    if (lastIndex < input.length) {
      parts.push(input.substring(lastIndex));
    }

    return parts;
  };

  return (
    <span className={className}>
      {processText(text)}
    </span>
  );
};

export default Linkify;
