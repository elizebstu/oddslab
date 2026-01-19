import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import type { Activity } from '../services/polymarketDirect';
import MarketTitle from './MarketTitle';
import { formatDisplayName, formatTimestamp } from '../utils/formatting';

interface ActivityCardProps {
  activity: Activity;
  isLatest?: boolean;
  showBorder?: boolean;
  polymarketUrl?: string;
}

// Hoist static SVG icons
const BUY_ICON = (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M7 11l5-5m0 0l5 5m-5-5v12" />
  </svg>
);

const SELL_ICON = (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M17 13l-5 5m0 0l-5-5m5 5V6" />
  </svg>
);

const REDEEM_ICON = (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
);

const EXTERNAL_LINK_ICON = (
  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
  </svg>
);

function ActivityCard({ activity, isLatest = false, showBorder = true, polymarketUrl }: ActivityCardProps) {
  const { t } = useTranslation();
  const isBuy = activity.type === 'buy';
  const isSell = activity.type === 'sell';
  const url = polymarketUrl ?? `https://polymarket.com/markets?_q=${encodeURIComponent(activity.market)}`;

  const getIcon = () => {
    if (isBuy) return BUY_ICON;
    if (isSell) return SELL_ICON;
    return REDEEM_ICON;
  };

  const getClassName = () => {
    if (isBuy) return 'bg-neon-green/5 border-neon-green/30 text-neon-green';
    if (isSell) return 'bg-neon-red/5 border-neon-red/30 text-neon-red';
    return 'bg-white/5 border-white/10 text-white/40';
  };

  return (
    <div className={`relative p-5 bg-background ${showBorder ? 'border border-border' : ''} hover:border-foreground/10 transition-all`}>
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-6 flex-1 min-w-0">
          <div className={`w-10 h-10 flex items-center justify-center shrink-0 border skew-x-[-6deg] ${getClassName()}`}>
            <div className="skew-x-[6deg]">
              {getIcon()}
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className="text-xs font-black text-foreground mb-1 uppercase tracking-tighter truncate">
                <MarketTitle text={activity.market} />
              </p>
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1 text-foreground/20 hover:text-neon-cyan transition-all opacity-0 group-hover:opacity-100"
                title={t('room_detail.view_on_polymarket', { defaultValue: 'View on Polymarket' })}
                onClick={(e) => e.stopPropagation()}
              >
                {EXTERNAL_LINK_ICON}
              </a>
            </div>
            <div className="flex items-center gap-3 text-[9px] font-black text-foreground/30 uppercase tracking-[0.2em]">
              <span className="text-foreground/60">{formatDisplayName(activity)}</span>
              <span className="text-white/10">•</span>
              <span className={isBuy ? 'text-neon-green' : isSell ? 'text-neon-red' : ''}>
                {isBuy ? t('room_detail.type_buy') : isSell ? t('room_detail.type_sell') : activity.type}
              </span>
              {activity.outcome && (
                <>
                  <span className="text-white/10">•</span>
                  <span className="text-neon-cyan">{activity.outcome}</span>
                </>
              )}
              <span className="text-white/10">•</span>
              <span className="text-foreground">${activity.amount.toLocaleString()}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {isLatest && (
            <span className="px-2 py-0.5 text-[8px] font-black bg-neon-cyan/20 text-neon-cyan uppercase tracking-widest">
              {t('room_detail.latest', { defaultValue: '最新' })}
            </span>
          )}
          <div className="text-[10px] font-bold text-foreground/20 uppercase tracking-widest">
            {formatTimestamp(activity.timestamp, t)}
          </div>
        </div>
      </div>
    </div>
  );
}

// Memoize with custom comparison to prevent unnecessary re-renders
export default memo(ActivityCard, (prevProps, nextProps) => {
  return (
    prevProps.activity === nextProps.activity &&
    prevProps.isLatest === nextProps.isLatest &&
    prevProps.showBorder === nextProps.showBorder
  );
});
