import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import type { ActivityGroup as ActivityGroupType } from '../utils/groupActivities';
import ActivityCard from './ActivityCard';

interface ActivityGroupProps {
  group: ActivityGroupType;
  isExpanded: boolean;
  minVolume?: number;
  maxVolume?: number;
  onToggle: (key: string) => void;
}

// Hoist static JSX for summary
const SEPARATOR = <span className="text-white/10">|</span>;

/**
 * Activity group component that displays grouped trading activities.
 * Handles both expanded and collapsed states.
 */
function ActivityGroup({ group, isExpanded, minVolume, maxVolume, onToggle }: ActivityGroupProps) {
  const { t } = useTranslation();
  const hasMultiple = group.activities.length > 1;
  const totalCount = group.buyCount + group.sellCount;

  // Filter based on volume (NOTE: This is already done at parent level, this is a safety check)
  // minVolume and maxVolume can be undefined or number
  const min = minVolume !== undefined && minVolume !== null ? minVolume : 0;
  const max = maxVolume !== undefined && maxVolume !== null ? maxVolume : Infinity;
  const groupTotal = group.totalBuyAmount + group.totalSellAmount;

  // Only filter if there's an actual filter set (min > 0 or max < Infinity)
  if (minVolume !== undefined || maxVolume !== undefined) {
    if (groupTotal < min || groupTotal > max) return null;
  }

  const renderSummary = () => (
    <div className="flex items-center gap-4 px-5 py-3 bg-muted/50 border-t border-border text-[9px] font-black uppercase tracking-widest">
      <span className="text-foreground/40">
        {t('room_detail.total_transactions', { count: totalCount, defaultValue: `共 ${totalCount} 笔` })}
      </span>
      {group.buyCount > 0 && (
        <>
          {SEPARATOR}
          <span className="text-neon-green">
            {t('room_detail.buy_summary', {
              amount: group.totalBuyAmount.toLocaleString(),
              count: group.buyCount,
              defaultValue: `买入: $${group.totalBuyAmount.toLocaleString()} (${group.buyCount}次)`
            })}
          </span>
        </>
      )}
      {group.sellCount > 0 && (
        <>
          {SEPARATOR}
          <span className="text-neon-red">
            {t('room_detail.sell_summary', {
              amount: group.totalSellAmount.toLocaleString(),
              count: group.sellCount,
              defaultValue: `卖出: $${group.totalSellAmount.toLocaleString()} (${group.sellCount}次)`
            })}
          </span>
        </>
      )}
      {group.positionValue !== null && (
        <>
          {SEPARATOR}
          <span className="text-neon-cyan">
            持仓: ${group.positionValue.toLocaleString()}
          </span>
        </>
      )}
      {group.profitLoss !== null && (
        <>
          {SEPARATOR}
          <span className={group.profitLoss >= 0 ? 'text-neon-green' : 'text-neon-red'}>
            盈亏: {group.profitLoss >= 0 ? '+' : ''}${group.profitLoss.toLocaleString()}
          </span>
        </>
      )}
    </div>
  );

  // Single activity - render normally without grouping
  if (!hasMultiple) {
    return (
      <div className="group">
        <ActivityCard
          activity={group.latestActivity}
          showBorder={true}
        />
      </div>
    );
  }

  // Multiple activities - render with grouping
  return (
    <div className="group">
      {isExpanded ? (
        // Expanded view
        <div
          onClick={() => onToggle(group.key)}
          className="cursor-pointer border border-border hover:border-foreground/20 transition-all"
        >
          {group.activities.map((act, idx) => (
            <div key={idx} className={idx > 0 ? 'border-t border-border' : ''}>
              <ActivityCard
                activity={act}
                isLatest={idx === 0}
                showBorder={false}
              />
            </div>
          ))}
          {renderSummary()}
        </div>
      ) : (
        // Collapsed view with stacking effect
        <div
          onClick={() => onToggle(group.key)}
          className="cursor-pointer relative"
        >
          {/* Stacking effect layers */}
          <div className="absolute inset-0 bg-background border border-border translate-x-2 translate-y-2 opacity-30" />
          {group.activities.length > 2 && (
            <div className="absolute inset-0 bg-background border border-border translate-x-1 translate-y-1 opacity-50" />
          )}
          {/* Main card */}
          <div className="relative bg-background border border-border hover:border-foreground/20 transition-all">
            <ActivityCard
              activity={group.latestActivity}
              showBorder={false}
            />
            {renderSummary()}
          </div>
        </div>
      )}
    </div>
  );
}

export default memo(ActivityGroup, (prevProps, nextProps) => {
  return (
    prevProps.group === nextProps.group &&
    prevProps.isExpanded === nextProps.isExpanded &&
    prevProps.minVolume === nextProps.minVolume &&
    prevProps.maxVolume === nextProps.maxVolume
  );
});
