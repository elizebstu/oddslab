import { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { useTranslate } from '../hooks/useTranslate';
import OnboardingTour from '../components/OnboardingTour';
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
    if (!activity?.address || !activity?.market) continue; // Skip invalid activities
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
  const [loading, setLoading] = useState(false); // Changed: show UI immediately
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [profileNames, setProfileNames] = useState<Map<string, string>>(new Map());
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [selectedAddresses, setSelectedAddresses] = useState<string[]>([]);
  const [showAddressFilter, setShowAddressFilter] = useState(false);
  const [allAddresses, setAllAddresses] = useState<string[]>([]);
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

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const dropdown = document.querySelector('.address-filter-dropdown');
      const button = document.querySelector('.address-filter-button');

      if (button && !button.contains(event.target as Node) &&
          dropdown && !dropdown.contains(event.target as Node)) {
        setShowAddressFilter(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadData = useCallback(async (_showLoading = false) => {
    
    // Step 1: Load from cache immediately (show stale data first)
    const cacheKey = 'feed_data';
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      try {
        const { activities, positions, lastUpdated } = JSON.parse(cached);
                setActivities(activities);
        setPositions(positions);
        setLastRefresh(new Date(lastUpdated));
        setLoading(false); // Data shown, no longer blocking
      } catch (e) {
        console.warn('Feed: failed to parse cache', e);
      }
    }

    // Step 2: Fetch fresh data in background
    try {
      const allRooms = await roomService.getRooms();
            setRooms(allRooms);

      // Aggregate and deduplicate all addresses across all rooms (normalize to lowercase)
      const uniqueAddresses = new Set<string>();
      allRooms.forEach(r => {
        (r.addresses || []).forEach(a => {
          if (a?.address) {
            uniqueAddresses.add(a.address.toLowerCase());
          }
        });
      });
      const addresses = Array.from(uniqueAddresses);
            setAllAddresses(addresses);

      if (addresses.length === 0) {
        setActivities([]);
        setPositions([]);
        setLastRefresh(new Date());
                setLoading(false);
        return;
      }

            const [fetchedActivities, fetchedPositions] = await Promise.all([
        fetchActivitiesFromPolymarket(addresses),
        fetchPositionsFromPolymarket(addresses)
      ]);
      
      // Update with fresh data
      setActivities(fetchedActivities);
      setPositions(fetchedPositions);
      setLastRefresh(new Date());

      // Update cache
      localStorage.setItem(cacheKey, JSON.stringify({
        activities: fetchedActivities,
        positions: fetchedPositions,
        lastUpdated: Date.now()
      }));

      // Fetch profile names (non-blocking)
      fetchProfileNames(addresses).then(names => {
                setProfileNames(names);
      }).catch(err => {
        console.warn('Feed: failed to load profile names:', err);
      });
    } catch (error) {
      console.error('Feed: Failed to load feed data:', error);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    loadData(false);
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

  // Filter activities based on selected addresses
  const filteredActivities = selectedAddresses.length > 0
    ? activities.filter(activity => selectedAddresses.some(addr => addr.toLowerCase() === activity.address.toLowerCase()))
    : activities;

  const groupedActivities = groupActivities(filteredActivities, positions);

  const getProfileName = (address: string): string | null => {
    return profileNames.get(address.toLowerCase()) || null;
  };

  const formatDisplayName = (activity: Activity): string => {
    const profileName = getProfileName(activity.address);
    if (profileName) return profileName;
    if (activity.userName) return activity.userName;
    return formatAddress(activity.address);
  };

  // Skeleton card component
  const ActivitySkeleton = () => (
    <div className="p-6 bg-card/50 border border-border animate-pulse">
      <div className="flex items-center gap-6">
        <div className="w-12 h-12 bg-muted/30" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-muted/20 w-1/2" />
          <div className="h-3 bg-muted/10 w-1/3" />
        </div>
        <div className="h-6 bg-muted/20 w-20" />
      </div>
    </div>
  );

  return (
    <>
      <Helmet>
        <title>智能钱交易动态 | Oddslab - Polymarket 交易追踪</title>
        <meta name="description" content="追踪所有房间的智能钱交易动态，实时查看顶级交易者在 Polymarket 的买卖行为和持仓数据。通过地址筛选功能快速定位感兴趣的交易者。" />
        <meta property="og:title" content="智能钱交易动态 | Oddslab" />
        <meta property="og:description" content="追踪所有房间的智能钱交易动态，实时查看顶级交易者在 Polymarket 的买卖行为和持仓数据。" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://oddslab.com/feed" />
        <meta property="og:image" content="https://oddslab.com/og-image.png" />
        <meta property="og:site_name" content="Oddslab" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content="https://oddslab.com/feed" />
        <meta name="twitter:title" content="智能钱交易动态 | Oddslab" />
        <meta name="twitter:description" content="追踪所有房间的智能钱交易动态，实时查看顶级交易者在 Polymarket 的买卖行为和持仓数据。" />
        <meta name="twitter:image" content="https://oddslab.com/og-image.png" />
        <link rel="canonical" href="https://oddslab.com/feed" />
      </Helmet>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 relative animate-fade-in">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-12 border-l-4 border-neon-cyan pl-6 py-2">
        <div className="space-y-1">
          <h1 className="text-4xl md:text-5xl font-display font-black uppercase tracking-tighter italic text-foreground">
            {t('nav.feed')}<span className="text-neon-cyan glow-text-cyan"></span>
          </h1>
          <div className="flex items-center gap-4 text-foreground/30 text-[10px] font-bold uppercase tracking-[0.2em]">
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-neon-cyan rounded-full animate-pulse" />
                {t('common.loading')}
              </span>
            ) : (
              <span>{groupedActivities.length} {t('feed.activity_groups')}</span>
            )}
            <span className="w-1 h-1 bg-foreground/10 rounded-full" />
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-neon-green rounded-full animate-pulse" />
              {t('room_detail.auto_refresh_active')}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {/* Data Sources Dropdown - Using same style as refresh button */}
          <div className="relative feed-filters" ref={null}>
            <button
              className={`inline-flex items-center justify-center font-display font-bold tracking-wider uppercase transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none rounded-none skew-x-[-6deg] text-[10px] px-4 py-1.5 border-2 ${
                showAddressFilter
                  ? 'bg-neon-cyan text-midnight-950 border-neon-cyan shadow-neon-cyan'
                  : selectedAddresses.length > 0
                  ? 'bg-neon-cyan/10 text-neon-cyan border-neon-cyan hover:bg-neon-cyan hover:text-midnight-950 shadow-[inset_0_0_10px_rgba(0,240,255,0.2)]'
                  : 'bg-midnight-950 text-neon-cyan border-neon-cyan hover:bg-neon-cyan hover:text-midnight-950 hover:shadow-neon-cyan shadow-[inset_0_0_10px_rgba(0,240,255,0.2)]'
              }`}
              onClick={() => setShowAddressFilter(!showAddressFilter)}
            >
              <span className="skew-x-[6deg] flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <span>{t('feed.filter_addresses')}</span>
                <span className={`px-1.5 py-0.5 ${showAddressFilter ? 'bg-midnight-950/20' : 'bg-midnight-950/20'} text-[8px]`}>
                  {selectedAddresses.length > 0 ? selectedAddresses.length : allAddresses.length}/{allAddresses.length}
                </span>
                <svg className={`w-3 h-3 transition-transform ${showAddressFilter ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
                </svg>
              </span>
            </button>

            {/* Address Filter Dropdown Panel */}
            {showAddressFilter && (
              <div className="address-filter-dropdown absolute right-0 top-full mt-2 w-[320px] bg-midnight-950 border border-neon-cyan/30 shadow-neon-cyan/20 z-50 animate-fade-in">
                <div className="p-4 border-b border-neon-cyan/20">
                  <h3 className="text-xs font-black uppercase tracking-widest text-neon-cyan/80">
                    {t('feed.select_addresses')}
                  </h3>
                </div>
                <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                  {allAddresses.length === 0 ? (
                    <div className="py-8 text-center">
                      <p className="text-sm font-black text-foreground/20 uppercase italic tracking-tighter">{t('feed.no_addresses')}</p>
                    </div>
                  ) : (
                    allAddresses.map((address) => {
                      const displayName = profileNames.get(address.toLowerCase()) || formatAddress(address);
                      const isSelected = selectedAddresses.includes(address);
                      return (
                        <div
                          key={address}
                          className={`flex items-center gap-3 px-4 py-3 hover:bg-neon-cyan/5 cursor-pointer ${
                            isSelected ? 'bg-neon-cyan/10' : ''
                          }`}
                          onClick={() => {
                            setSelectedAddresses(prev => {
                              if (isSelected) {
                                return prev.filter(addr => addr !== address);
                              } else {
                                return [...prev, address];
                              }
                            });
                          }}
                        >
                          <div className={`w-2 h-2 rounded-full ${isSelected ? 'bg-neon-cyan shadow-neon-cyan' : 'bg-foreground/20'}`} />
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold text-foreground truncate">{displayName}</p>
                            <p className="text-[10px] font-mono text-foreground/40 truncate">{formatAddress(address)}</p>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
                <div className="p-4 border-t border-neon-cyan/20 flex items-center justify-between gap-2">
                  <button
                    onClick={() => setSelectedAddresses([])}
                    className="flex-1 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-foreground/60 hover:text-neon-red transition-all"
                  >
                    {t('feed.clear_all')}
                  </button>
                  <button
                    onClick={() => setSelectedAddresses(allAddresses)}
                    className="flex-1 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-foreground/60 hover:text-neon-green transition-all"
                  >
                    {t('feed.select_all')}
                  </button>
                </div>
              </div>
            )}
          </div>

          <span className="text-[10px] font-mono font-bold text-foreground/30 uppercase tracking-widest">
            {t('room_detail.last_refresh', { time: formatTimestamp(lastRefresh.toISOString(), t) })}
          </span>
          <Button
            onClick={handleRefresh}
            disabled={isRefreshing}
            variant="cyber"
            size="sm"
            isLoading={isRefreshing}
            className="feed-refresh-btn"
          >
            {t('room_detail.refresh_now')}
          </Button>
        </div>
      </div>

      {/* No data state */}
      {loading ? (
        // Skeleton loading state
        <div className="space-y-4">
          <ActivitySkeleton />
          <ActivitySkeleton />
          <ActivitySkeleton />
        </div>
      ) : rooms.length === 0 ? (
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
                className={`activity-item p-0 bg-card/50 border-border hover:border-foreground/10 transition-all overflow-hidden ${
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

    {/* Onboarding Tour */}
    <OnboardingTour pageName="feed" />
    </>
  );
}
