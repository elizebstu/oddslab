import { memo } from 'react';

interface RoomSocialLinksProps {
  twitterLink?: string | null;
  telegramLink?: string | null;
  discordLink?: string | null;
}

// Hoist static SVG icons
const TWITTER_ICON = (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const TELEGRAM_ICON = (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-2.692-1.989-1.398 1.343-.65 1.343-1.425-1.343-.108-.108-.198-.108-.353.108l-3.418 1.622-3.228-1.989c-.663-.408-1.371.018-.972.658l1.878 8.314c.217.97.897 1.317 1.695 1.695l6.406 1.989c.798.25 1.695-.29 1.695-1.089z" />
  </svg>
);

const DISCORD_ICON = (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.124c-.211.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.323 12.323 0 0 0-.617-1.25.074.074 0 0 0-.078-.124 19.736 19.736 0 0 0-4.885 1.515.069.069 0 0 0-.032.029c-.03.025-.05.06-.056.09a18.64 18.64 0 0 0 2.016 3.469 15.919 15.919 0 0 0 1.884 3.278c.05.088.09.12.198.088.304a15.79 15.79 0 0 1-1.619 5.876.074.074 0 0 0-.084.092 19.685 19.685 0 0 0-5.926 0 .074.074 0 0 0-.084-.092 15.79 15.79 0 0 1-1.619-5.876c0-.106.038-.216.088-.304.088a15.919 15.919 0 0 0 1.884-3.278c.04-.03.056-.064.056-.09a18.64 18.64 0 0 0 2.016-3.469c.006-.03.026-.004-.056-.029a.069.069 0 0 0-.032-.029zM8.02 15.33c-1.183 0-2.143-1.18-2.143-2.636 0-1.456.96-2.637 2.143-2.637 1.183 0 2.143 1.18 2.143 2.637 0 1.456-.96 2.637-2.143 2.637zm7.975 0c-1.183 0-2.143-1.18-2.143-2.636 0-1.456.96-2.637 2.143-2.637 1.183 0 2.143 1.18 2.143 2.637 0 1.456-.96 2.637-2.143 2.637z" />
  </svg>
);

/**
 * Social links component for room display.
 * Memoized to prevent unnecessary re-renders since props rarely change.
 */
function RoomSocialLinks({ twitterLink, telegramLink, discordLink }: RoomSocialLinksProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {twitterLink && (
        <a
          href={twitterLink}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 bg-muted/50 border border-border hover:border-neon-cyan/50 hover:bg-neon-cyan/5 transition-all group skew-x-[-6deg]"
        >
          <span className="skew-x-[6deg] flex items-center gap-2 text-foreground/70 group-hover:text-neon-cyan">
            {TWITTER_ICON}
            <span className="text-xs font-bold uppercase tracking-wider">Twitter</span>
          </span>
        </a>
      )}
      {telegramLink && (
        <a
          href={telegramLink}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 bg-muted/50 border border-border hover:border-sky-500/50 hover:bg-sky-500/5 transition-all group skew-x-[-6deg]"
        >
          <span className="skew-x-[6deg] flex items-center gap-2 text-foreground/70 group-hover:text-sky-500">
            {TELEGRAM_ICON}
            <span className="text-xs font-bold uppercase tracking-wider">Telegram</span>
          </span>
        </a>
      )}
      {discordLink && (
        <a
          href={discordLink}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 bg-muted/50 border border-border hover:border-indigo-500/50 hover:bg-indigo-500/5 transition-all group skew-x-[-6deg]"
        >
          <span className="skew-x-[6deg] flex items-center gap-2 text-foreground/70 group-hover:text-indigo-500">
            {DISCORD_ICON}
            <span className="text-xs font-bold uppercase tracking-wider">Discord</span>
          </span>
        </a>
      )}
    </div>
  );
}

export default memo(RoomSocialLinks);
