import { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useTranslate } from '../hooks/useTranslate';
import LoadingSpinner from '../components/LoadingSpinner';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { roomService } from '../services/roomService';
import {
  fetchActivitiesFromPolymarket,
  fetchPositionsFromPolymarket,
  fetchProfileNames,
  type Activity,
  type Position
} from '../services/polymarketDirect';
import { formatAddress, formatTimestamp } from '../utils/formatting';

interface ActivityGroup {
  key: string;
  activities: Activity[];
  latestActivity: Activity;
  totalBuyAmount: number;
  totalSellAmount: number;
  buyCount: number;
  sellCount: number;
  positionValue: number | null;
  profitLoss: number | null;
}

const AUTO_REFRESH_INTERVAL = 120000; // 2 minutes

function groupActivities(activities: Activity[], positions: Position[]): ActivityGroup[] {
  const groupMap = new Map<string, Activity[]>();

  // Group by address + market name (normalized)
  for (const activity of activities) {
    const marketKey = activity.market.trim().toLowerCase();
    const key = `${activity.address.toLowerCase()}-${marketKey}`;
    const existing = groupMap.get(key) || [];
    existing.push(activity);
    groupMap.set(key, existing);
  }

  // Build a lookup map for positions: marketName (lowercase) -> Position
  const positionMap = new Map<string, Position>();
  for (const pos of positions) {
    const marketKey = pos.market.trim().toLowerCase();
    positionMap.set(marketKey, pos);
  }

  // Convert to ActivityGroup array
  const groups: ActivityGroup[] = [];
  for (const [key, acts] of groupMap) {
    const sorted = [...acts].sort((a, b) =>
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    let totalBuyAmount = 0;
    let totalSellAmount = 0;
    let buyCount = 0;
    let sellCount = 0;

    for (const act of sorted) {
      if (act.type === 'buy') {
        totalBuyAmount += act.amount;
        buyCount++;
      } else if (act.type === 'sell') {
        totalSellAmount += act.amount;
        sellCount++;
      }
    }

    // Find matching position value
    const address = sorted[0].address.toLowerCase();
    const marketKey = sorted[0].market.trim().toLowerCase();
    const position = positionMap.get(marketKey);
    let positionValue: number | null = null;
    let profitLoss: number | null = null;

    if (position) {
      const holder = position.holders?.find(h => h.address.toLowerCase() === address);
      if (holder) {
        positionValue = holder.value;
        profitLoss = positionValue + totalSellAmount - totalBuyAmount;
      } else {
        profitLoss = totalSellAmount - totalBuyAmount;
        positionValue = 0;
      }
    }

    groups.push({
      key,
      activities: sorted,
      latestActivity: sorted[0],
      totalBuyAmount,
      totalSellAmount,
      buyCount,
      sellCount,
      positionValue,
      profitLoss,
    });
  }

  // Sort groups by latest activity timestamp
  groups.sort((a, b) =>
    new Date(b.latestActivity.timestamp).getTime() - new Date(a.latestActivity.timestamp).getTime()
  );

  return groups;
}

function MarketTitle({ text }: { text: string }) {
  const translated = useTranslate(text);
  return <>{translated}</>;
}

export default function Feed() {
  const { t } = useTranslation();
  const [rooms, setRooms] = useState<any[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [profileNames, setProfileNames] = useState<Map<string, string>>(new Map());
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const refreshTimerRef = useRef<number | null>(null);

  const toggleGroupExpanded = (key: string) => {
    setExpandedGroups(prev => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const loadData = useCallback(async (showLoading = false) => {
    if (showLoading) setLoading(true);
    try {
      const allRooms = await roomService.getRooms();
      setRooms(allRooms);

      const allAddresses = Array.from(new Set(allRooms.flatMap(r => r.addresses || []).map(a => a.address)));

      if (allAddresses.length === 0) {
        setActivities([]);
        setPositions([]);
        setLastRefresh(new Date());
        return;
      }

      const [fetchedActivities, fetchedPositions] = await Promise.all([
        fetchActivitiesFromPolymarket(allAddresses),
        fetchPositionsFromPolymarket(allAddresses)
      ]);

      setActivities(fetchedActivities);
      setPositions(fetchedPositions);
      setLastRefresh(new Date());

      // Fetch profile names
      const names = await fetchProfileNames(allAddresses);
      setProfileNames(names);
    } catch (error) {
      console.error('Failed to load feed data:', error);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    loadData(false);
  }, [loadData]);

  useEffect(() => {
    loadData(true);
  }, [loadData]);

  // Auto-refresh every 2 minutes
  useEffect(() => {
    refreshTimerRef.current = window.setInterval(() => {
      handleRefresh();
    }, AUTO_REFRESH_INTERVAL);

    return () => {
      if (refreshTimerRef.current) {
        clearInterval(refreshTimerRef.current);
      }
    };
  }, [handleRefresh]);

  const groupedActivities = groupActivities(activities, positions);

  const getProfileName = (address: string): string | null => {
    return profileNames.get(address.toLowerCase()) || null;
  };

  const formatDisplayName = (activity: Activity): string => {
    const profileName = getProfileName(activity.address);
    if (profileName) return profileName;
    if (activity.userName) return activity.userName;
    return formatAddress(activity.address);
  };

  if (loading) {
    return <LoadingSpinner fullScreen text={t('common.loading')} />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 relative animate-fade-in">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-12 border-l-4 border-neon-cyan pl-6 py-2">
        <div className="space-y-1">
          <h1 className="text-4xl md:text-5xl font-display font-black uppercase tracking-tighter italic text-foreground">
            {t('nav.feed')}<span className="text-neon-cyan glow-text-cyan"></span>
          </h1>
          <div className="flex items-center gap-4 text-foreground/30 text-[10px] font-bold uppercase tracking-[0.2em]">
            <span>{groupedActivities.length} {t('feed.activity_groups')}</span>
            <span className="w-1 h-1 bg-foreground/10 rounded-full" />
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-neon-green rounded-full animate-pulse" />
              {t('room_detail.auto_refresh_active')}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-[10px] font-mono font-bold text-foreground/30 uppercase tracking-widest">
            {t('room_detail.last_refresh', { time: formatTimestamp(lastRefresh.toISOString(), t) })}
          </span>
          <Button
            onClick={handleRefresh}
            disabled={isRefreshing}
            variant="cyber"
            size="sm"
            isLoading={isRefreshing}
          >
            {t('room_detail.refresh_now')}
          </Button>
        </div>
      </div>

      {/* No data state */}
      {rooms.length === 0 ? (
        <div className="bg-card/30 border border-dashed border-border p-24 text-center">
          <p className="text-lg font-black text-foreground/20 uppercase italic tracking-tighter">
            {t('feed.no_rooms_message')}
          </p>
        </div>
      ) : groupedActivities.length === 0 ? (
        <div className="bg-card/30 border border-dashed border-border p-24 text-center">
          <p className="text-lg font-black text-foreground/20 uppercase italic tracking-tighter">
            {t('room_detail.no_activity')}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {groupedActivities.map((group) => {
            const isBuy = group.latestActivity.type === 'buy';
            const isSell = group.latestActivity.type === 'sell';
            const isExpanded = expandedGroups.has(group.key);
            const displayName = formatDisplayName(group.latestActivity);

            return (
              <Card
                key={group.key}
                className={`p-0 bg-card/50 border-border hover:border-foreground/10 transition-all overflow-hidden ${
                  isExpanded ? 'border-neon-cyan/30' : ''
                }`}
              >
                {/* Main Activity Row */}
                <div
                  className="p-6 cursor-pointer hover:bg-card/80 transition-colors"
                  onClick={() => toggleGroupExpanded(group.key)}
                >
                  <div className="flex items-center justify-between gap-6">
                    <div className="flex items-center gap-6 flex-1 min-w-0">
                      {/* Icon */}
                      <div className={`w-12 h-12 border skew-x-[-12deg] flex items-center justify-center shrink-0 ${
                        isBuy ? 'border-neon-green/30 text-neon-green bg-neon-green/5' :
                        isSell ? 'border-neon-red/30 text-neon-red bg-neon-red/5' :
                        'border-border text-foreground/20 bg-muted/30'
                      }`}>
                        <div className="skew-x-[12deg]">
                          {isBuy ? (
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                            </svg>
                          ) : isSell ? (
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M17 13l-5 5m0 0l-5-5m5 5V6" />
                            </svg>
                          ) : (
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                          )}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="min-w-0 space-y-1 flex-1">
                        <p className="text-sm font-black text-foreground group-hover:text-neon-cyan transition-colors uppercase tracking-tight truncate leading-tight">
                          <MarketTitle text={group.latestActivity.market} />
                        </p>
                        <div className="flex items-center gap-3 text-[9px] font-bold text-foreground/30 uppercase tracking-[0.2em]">
                          <span className="text-foreground/60">{displayName}</span>
                          <span className="text-foreground/10">•</span>
                          <span className={isBuy ? 'text-neon-green' : isSell ? 'text-neon-red' : ''}>
                            {isBuy ? t('room_detail.type_buy') : isSell ? t('room_detail.type_sell') : group.latestActivity.type}
                          </span>
                          <span className="text-foreground/10">•</span>
                          <span className="text-foreground">${group.latestActivity.amount.toLocaleString()}</span>
                          {group.buyCount + group.sellCount > 1 && (
                            <>
                              <span className="text-foreground/10">•</span>
                              <span className="text-neon-cyan">
                                {group.buyCount + group.sellCount} {t('feed.transactions')}
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* P&L */}
                      {group.profitLoss !== null && (
                        <div className="text-right shrink-0">
                          <p className="text-[10px] font-bold uppercase tracking-wider mb-1 text-foreground/30">{t('feed.pnl')}</p>
                          <p className={`text-sm font-black font-mono ${
                            group.profitLoss > 0 ? 'text-neon-green' :
                            group.profitLoss < 0 ? 'text-neon-red' :
                            'text-foreground/50'
                          }`}>
                            {group.profitLoss > 0 ? '+' : ''}${group.profitLoss.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                          </p>
                        </div>
                      )}

                      {/* Expand Icon */}
                      <div className={`shrink-0 transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                        <svg className="w-5 h-5 text-foreground/20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>

                    {/* Timestamp */}
                    <div className="text-[10px] font-mono font-bold text-foreground/10 uppercase tracking-widest shrink-0">
                      {formatTimestamp(group.latestActivity.timestamp, t)}
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="border-t border-border bg-card/30 p-6 space-y-4">
                    {/* Summary Stats */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <div className="bg-card/50 border border-border p-3">
                        <p className="text-[9px] font-bold text-foreground/30 uppercase tracking-widest mb-1">{t('feed.total_buys')}</p>
                        <p className="text-sm font-black font-mono text-neon-green">${group.totalBuyAmount.toLocaleString()}</p>
                        <p className="text-[10px] text-foreground/40">{group.buyCount} {t('feed.transactions')}</p>
                      </div>
                      <div className="bg-card/50 border border-border p-3">
                        <p className="text-[9px] font-bold text-foreground/30 uppercase tracking-widest mb-1">{t('feed.total_sells')}</p>
                        <p className="text-sm font-black font-mono text-neon-red">${group.totalSellAmount.toLocaleString()}</p>
                        <p className="text-[10px] text-foreground/40">{group.sellCount} {t('feed.transactions')}</p>
                      </div>
                      {group.positionValue !== null && (
                        <div className="bg-card/50 border border-border p-3">
                          <p className="text-[9px] font-bold text-foreground/30 uppercase tracking-widest mb-1">{t('feed.current_position')}</p>
                          <p className="text-sm font-black font-mono text-foreground">${group.positionValue.toLocaleString()}</p>
                        </div>
                      )}
                      {group.profitLoss !== null && (
                        <div className="bg-card/50 border border-border p-3">
                          <p className="text-[9px] font-bold text-foreground/30 uppercase tracking-widest mb-1">{t('feed.pnl')}</p>
                          <p className={`text-sm font-black font-mono ${
                            group.profitLoss > 0 ? 'text-neon-green' :
                            group.profitLoss < 0 ? 'text-neon-red' :
                            'text-foreground/50'
                          }`}>
                            {group.profitLoss > 0 ? '+' : ''}${group.profitLoss.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Transaction History */}
                    <div className="space-y-2">
                      <p className="text-[10px] font-bold text-foreground/30 uppercase tracking-widest">{t('feed.transaction_history')}</p>
                      {group.activities.map((act, idx) => {
                        const actIsBuy = act.type === 'buy';
                        return (
                          <div key={idx} className="flex items-center justify-between p-3 bg-card/50 border border-border">
                            <div className="flex items-center gap-4">
                              <div className={`w-2 h-2 rounded-full ${
                                actIsBuy ? 'bg-neon-green' : 'bg-neon-red'
                              }`} />
                              <span className={`text-[10px] font-bold uppercase ${
                                actIsBuy ? 'text-neon-green' : 'text-neon-red'
                              }`}>
                                {act.type}
                              </span>
                              <span className="text-sm font-mono font-bold text-foreground">
                                ${act.amount.toLocaleString()}
                              </span>
                            </div>
                            <span className="text-[10px] font-mono text-foreground/30">
                              {formatTimestamp(act.timestamp, t)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
