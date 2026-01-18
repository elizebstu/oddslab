import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useTranslate } from '../hooks/useTranslate';
import LoadingSpinner from '../components/LoadingSpinner';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Linkify from '../components/ui/Linkify';
import { roomService } from '../services/roomService';
import { addressService } from '../services/addressService';
import {
  fetchActivitiesFromPolymarket,
  fetchPositionsFromPolymarket,
  fetchProfileNames,
  type Activity,
  type Position
} from '../services/polymarketDirect';
import { getRoomCache, setRoomCache } from '../services/roomCacheService';
import type { Room, Address } from '../services/roomService';
import { formatAddress, formatDisplayName, formatTimestamp, getRankBadge } from '../utils/formatting';

type TabType = 'positions' | 'activities';
const AUTO_REFRESH_INTERVAL = 120000; // 2 minutes

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

function groupActivities(activities: Activity[], positions: Position[]): ActivityGroup[] {
  const groupMap = new Map<string, Activity[]>();

  // Group by address + market name (normalized)
  for (const activity of activities) {
    // Use market name as the key, normalized to handle any whitespace differences
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
    // Sort by timestamp descending (newest first)
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
        // No position found for this address - might have sold everything
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

export default function RoomDetail() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [room, setRoom] = useState<Room | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [addressInput, setAddressInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);
  const [addError, setAddError] = useState('');
  const [activeTab, setActiveTab] = useState<TabType>('positions');
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [minVolume, setMinVolume] = useState<string>('');
  const [maxVolume, setMaxVolume] = useState<string>('');
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

  const loadRoom = async () => {
    try {
      const data = await roomService.getRoom(id!);
      setRoom(data);
    } catch (error) {
      console.error('Failed to load room:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAddressProfiles = async (): Promise<Address[]> => {
    try {
      // First get addresses from our backend
      const data = await addressService.getAddresses(id!);

      // Then fetch profile names directly from Polymarket
      const addressList = data.map((a: Address) => a.address);
      const profileNames = await fetchProfileNames(addressList);

      // Merge profile names with address data
      const addressesWithProfiles = data.map((addr: Address) => ({
        ...addr,
        userName: profileNames.get(addr.address.toLowerCase()) || null,
      }));

      setAddresses(addressesWithProfiles);
      return addressesWithProfiles;
    } catch (error) {
      console.error('Failed to load address profiles:', error);
      return [];
    }
  };

  const loadActivities = async (addressList?: string[]): Promise<Activity[]> => {
    try {
      // Get addresses first
      const addrs = addressList || (addresses.length > 0
        ? addresses.map(a => a.address)
        : (await addressService.getAddresses(id!)).map((a: Address) => a.address));

      // Fetch activities directly from Polymarket
      const data = await fetchActivitiesFromPolymarket(addrs);
      setActivities(data);
      return data;
    } catch (error) {
      console.error('Failed to load activities:', error);
      return [];
    }
  };

  const loadPositions = async (addressList?: string[]): Promise<Position[]> => {
    try {
      // Get addresses first
      const addrs = addressList || (addresses.length > 0
        ? addresses.map(a => a.address)
        : (await addressService.getAddresses(id!)).map((a: Address) => a.address));

      // Fetch positions directly from Polymarket
      const data = await fetchPositionsFromPolymarket(addrs);
      setPositions(data);
      return data;
    } catch (error) {
      console.error('Failed to load positions:', error);
      return [];
    }
  };

  const refreshData = useCallback(async () => {
    if (!id) return;
    setIsRefreshing(true);
    try {
      // Load addresses first
      const loadedAddresses = await loadAddressProfiles();
      const addressList = loadedAddresses.map(a => a.address);

      // Load positions and activities in parallel
      const [loadedPositions, loadedActivities] = await Promise.all([
        loadPositions(addressList),
        loadActivities(addressList),
      ]);

      // Save to cache
      setRoomCache(id, loadedAddresses, loadedActivities, loadedPositions);
      setLastRefresh(new Date());
    } finally {
      setIsRefreshing(false);
    }
  }, [id]);

  // Initial load with cache
  useEffect(() => {
    if (!id) return;

    // First, try to load from cache for immediate display
    const cached = getRoomCache(id);
    if (cached) {
      setAddresses(cached.addresses);
      setActivities(cached.activities);
      setPositions(cached.positions);
      setLastRefresh(new Date(cached.lastUpdated));
    }

    // Load room info
    loadRoom();

    // Always refresh data in background
    refreshData();
  }, [id]);

  // Auto-refresh every 2 minutes
  useEffect(() => {
    if (!id) return;

    refreshTimerRef.current = window.setInterval(() => {
      refreshData();
    }, AUTO_REFRESH_INTERVAL);

    return () => {
      if (refreshTimerRef.current) {
        clearInterval(refreshTimerRef.current);
      }
    };
  }, [id, refreshData]);

  const handleAddAddresses = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddError('');
    const addressList = addressInput.split(/[,\n]/).map(a => a.trim()).filter(a => a);
    try {
      await addressService.addAddresses(id!, addressList);
      setAddressInput('');
      loadRoom();
      refreshData(); // Refresh all data and update cache
    } catch (error: any) {
      setAddError(error.response?.data?.error || 'Failed to add address.');
    }
  };

  const handleRemoveAddress = async (addressId: string) => {
    try {
      await addressService.removeAddress(id!, addressId);
      loadRoom();
      refreshData(); // Refresh all data and update cache
    } catch (error) {
      console.error('Failed to remove address:', error);
    }
  };

  const handleToggleVisibility = async () => {
    try {
      await roomService.toggleVisibility(id!);
      loadRoom();
    } catch (error) {
      console.error('Failed to toggle visibility:', error);
    }
  };

  const copyPublicLink = () => {
    const link = `${window.location.origin}/public/${id}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const copyAddress = (address: string) => {
    navigator.clipboard.writeText(address);
    setCopiedAddress(address);
    setTimeout(() => setCopiedAddress(null), 2000);
  };

  if (loading) {
    return <LoadingSpinner fullScreen text={t('room_detail.loading')} />;
  }

  if (!room) {
    return (
      <div className="flex-1 flex items-center justify-center p-6 bg-background">
        <Card variant="neon-red" className="p-12 text-center max-w-sm border-2 border-neon-red shadow-neon-red">
          <div className="text-neon-red mb-6 animate-glitch">
            <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-2xl font-black uppercase tracking-tighter mb-4 italic text-foreground">{t('room_detail.not_found')}</h1>
          <p className="text-foreground/40 mb-8 text-xs font-bold uppercase tracking-widest">{t('room_detail.not_found_desc')}</p>
          <Button onClick={() => navigate('/dashboard')} variant="danger" className="w-full">
            {t('room_detail.back')}
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 relative animate-fade-in">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-8 mb-16 border-l-4 border-neon-cyan pl-6">
        <div className="space-y-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="group flex items-center text-[10px] font-bold text-foreground/30 hover:text-neon-cyan transition-colors uppercase tracking-widest"
          >
            <svg className="w-3 h-3 mr-2 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" /></svg>
            {t('room_detail.back')}
          </button>
          <h1 className="text-5xl font-display font-black uppercase tracking-tighter italic text-foreground">
            {room.name}
          </h1>
          {room.description && (
            <div className="text-sm text-foreground/60 leading-relaxed max-w-2xl">
              <Linkify>{room.description}</Linkify>
            </div>
          )}
          {/* Social Links */}
          {(room.twitterLink || room.telegramLink || room.discordLink) && (
            <div className="flex flex-wrap items-center gap-3">
              {room.twitterLink && (
                <a
                  href={room.twitterLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-muted/50 border border-border hover:border-neon-cyan/50 hover:bg-neon-cyan/5 transition-all group"
                >
                  <svg className="w-4 h-4 text-foreground/40 group-hover:text-neon-cyan" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                  <span className="text-[10px] font-bold text-foreground/40 group-hover:text-neon-cyan uppercase tracking-wider">X</span>
                </a>
              )}
              {room.telegramLink && (
                <a
                  href={room.telegramLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-muted/50 border border-border hover:border-neon-cyan/50 hover:bg-neon-cyan/5 transition-all group"
                >
                  <svg className="w-4 h-4 text-foreground/40 group-hover:text-neon-cyan" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
                  </svg>
                  <span className="text-[10px] font-bold text-foreground/40 group-hover:text-neon-cyan uppercase tracking-wider">Telegram</span>
                </a>
              )}
              {room.discordLink && (
                <a
                  href={room.discordLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-muted/50 border border-border hover:border-neon-cyan/50 hover:bg-neon-cyan/5 transition-all group"
                >
                  <svg className="w-4 h-4 text-foreground/40 group-hover:text-neon-cyan" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                  </svg>
                  <span className="text-[10px] font-bold text-foreground/40 group-hover:text-neon-cyan uppercase tracking-wider">Discord</span>
                </a>
              )}
            </div>
          )}
          <div className="flex flex-wrap items-center gap-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-neon-green text-midnight-950 text-[10px] font-black uppercase tracking-widest skew-x-[-12deg]">
              <span className="skew-x-[12deg]">{addresses.length} {t('room_detail.monitoring_targets')}</span>
            </div>
            <p className="text-[10px] font-bold text-foreground/30 uppercase tracking-widest">
              {t('room_detail.last_updated', { time: formatTimestamp(lastRefresh.toISOString(), t) })}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Button variant="cyber" onClick={handleToggleVisibility} className="min-w-[160px]">
            {room.isPublic ? t('room_detail.make_private') : t('room_detail.make_public')}
          </Button>
          {room.isPublic && (
            <Button variant="primary" onClick={copyPublicLink} className="min-w-[160px]">
              {copied ? t('room_detail.link_copied') : t('room_detail.share_link')}
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Sidebar - Addresses */}
        <div className="lg:col-span-4 space-y-8">
          <Card className="p-8 border-border bg-card/50">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-black uppercase tracking-tighter mb-8 italic flex items-center gap-3">
                <span className="w-2 h-8 bg-neon-cyan/20" />
                {t('room_detail.addresses')}
              </h2>
              <span className="text-[10px] font-mono text-neon-cyan/50">{addresses.length}/50</span>
            </div>

            <form onSubmit={handleAddAddresses} className="space-y-4 mb-10">
              <textarea
                value={addressInput}
                onChange={(e) => setAddressInput(e.target.value)}
                placeholder="Paste wallet addresses or usernames..."
                className="w-full min-h-[120px] p-4 bg-muted border border-border focus:border-neon-cyan outline-none font-mono text-xs text-foreground placeholder:text-foreground/20 transition-all"
              />

              {addError && (
                <div className="text-[10px] font-bold text-neon-red uppercase tracking-widest bg-neon-red/10 p-3 italic">
                  {addError}
                </div>
              )}

              <Button type="submit" variant="secondary" className="w-full !bg-neon-cyan !border-neon-cyan">
                Add Addresses
              </Button>
            </form>

            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {addresses.map((addr) => (
                <div key={addr.id} className="group relative flex justify-between items-center p-4 bg-background border border-border hover:border-foreground/20 transition-all">
                  <div className="flex items-center gap-4 overflow-hidden flex-1 min-w-0">
                    <div className="w-9 h-9 bg-muted border border-border flex items-center justify-center text-neon-cyan font-mono font-bold text-[10px] skew-x-[-6deg] shrink-0">
                      <span className="skew-x-[6deg]">{addr.address.slice(2, 4).toUpperCase()}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      {addr.userName ? (
                        <>
                          <p className="text-xs font-bold text-foreground truncate">{addr.userName}</p>
                          <p className="text-[10px] font-mono text-foreground/40 truncate">{formatAddress(addr.address)}</p>
                        </>
                      ) : (
                        <>
                          <p className="text-xs font-mono font-bold text-foreground truncate">{formatAddress(addr.address)}</p>
                          <p className="text-[8px] font-bold text-foreground/20 uppercase tracking-[0.2em] mt-1">Monitoring</p>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => copyAddress(addr.address)}
                      className="p-2 text-white/20 hover:text-neon-cyan transition-all opacity-0 group-hover:opacity-100"
                      title="Copy address"
                    >
                      {copiedAddress === addr.address ? (
                        <svg className="w-4 h-4 text-neon-green" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                      )}
                    </button>
                    <button
                      onClick={() => handleRemoveAddress(addr.id)}
                      className="p-2 text-white/20 hover:text-neon-red transition-all opacity-0 group-hover:opacity-100"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Main Feed */}
        <div className="lg:col-span-8">
          <Card className="border-border bg-card/50 backdrop-blur-md overflow-hidden">
            {/* Auto-refresh status bar */}
            <div className="flex items-center justify-between px-8 py-4 bg-muted/50 border-b border-border">
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${isRefreshing ? 'bg-neon-cyan animate-pulse' : 'bg-neon-green'}`} />
                <span className="text-[10px] font-bold text-foreground/50 uppercase tracking-widest">
                  {isRefreshing ? t('room_detail.refreshing') : t('room_detail.auto_refresh_active')}
                </span>
              </div>
              <span className="text-[10px] font-bold text-foreground/30 uppercase tracking-widest">
                {t('room_detail.last_updated', { time: formatTimestamp(lastRefresh.toISOString(), t) })}
              </span>
            </div>

            <div className="grid grid-cols-2 bg-muted/30 p-2 border-b border-border">
              <button
                onClick={() => setActiveTab('positions')}
                className={`flex items-center justify-center gap-3 py-4 text-xs font-black uppercase tracking-[0.2em] transition-all skew-x-[-12deg] ${activeTab === 'positions'
                  ? 'bg-neon-green text-midnight-950 shadow-neon-green'
                  : 'text-foreground/40 hover:text-foreground hover:bg-foreground/5'
                  }`}
              >
                <span className="skew-x-[12deg]">{t('room_detail.tabs.positions')}</span>
              </button>
              <button
                onClick={() => setActiveTab('activities')}
                className={`flex items-center justify-center gap-3 py-4 text-xs font-black uppercase tracking-[0.2em] transition-all skew-x-[-12deg] ${activeTab === 'activities'
                  ? 'bg-neon-cyan text-midnight-950 shadow-neon-cyan'
                  : 'text-foreground/40 hover:text-foreground hover:bg-foreground/5'
                  }`}
              >
                <span className="skew-x-[12deg]">{t('room_detail.tabs.activity')}</span>
              </button>
            </div>

            <div className="p-8">
              {/* Filter controls - shared between tabs */}
              <div className="flex items-center gap-4 mb-6 p-4 bg-muted/50 border border-border">
                <span className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest">{t('room_detail.filter_amount')}:</span>
                <input
                  type="number"
                  placeholder={t('room_detail.min_amount')}
                  value={minVolume}
                  onChange={(e) => setMinVolume(e.target.value)}
                  className="w-24 px-3 py-1.5 bg-background border border-border text-foreground text-[11px] font-mono placeholder:text-foreground/20 focus:border-neon-cyan outline-none"
                />
                <span className="text-foreground/20">-</span>
                <input
                  type="number"
                  placeholder={t('room_detail.max_amount')}
                  value={maxVolume}
                  onChange={(e) => setMaxVolume(e.target.value)}
                  className="w-24 px-3 py-1.5 bg-background border border-border text-foreground text-[11px] font-mono placeholder:text-foreground/20 focus:border-neon-cyan outline-none"
                />
                <span className="text-[10px] font-bold text-foreground/30 uppercase tracking-widest">USD</span>
                {(minVolume || maxVolume) && (
                  <button
                    onClick={() => { setMinVolume(''); setMaxVolume(''); }}
                    className="ml-2 text-[9px] font-bold text-neon-red hover:text-neon-red/80 uppercase tracking-widest transition-all"
                  >
                    {t('room_detail.clear_filter', { defaultValue: 'Clear' })}
                  </button>
                )}
              </div>

              {activeTab === 'positions' ? (
                <div className="space-y-6">
                  {positions.length === 0 ? (
                    <div className="py-32 text-center">
                      <p className="text-xl font-black text-white/20 uppercase italic tracking-tighter">{t('room_detail.no_positions')}</p>
                    </div>
                  ) : (
                    positions
                      .filter((pos) => {
                        const min = minVolume ? parseFloat(minVolume) : 0;
                        const max = maxVolume ? parseFloat(maxVolume) : Infinity;
                        return pos.totalValue >= min && pos.totalValue <= max;
                      })
                      .map((pos, idx) => {
                      const badge = getRankBadge(idx);
                      // Try slug first, then conditionId, then search
                      let polymarketUrl: string;
                      if (pos.marketSlug) {
                        polymarketUrl = `https://polymarket.com/event/${pos.marketSlug}`;
                      } else if (pos.conditionId) {
                        polymarketUrl = `https://polymarket.com/event?id=${pos.conditionId}`;
                      } else {
                        polymarketUrl = `https://polymarket.com/markets?_q=${encodeURIComponent(pos.market)}`;
                      }
                      return (
                        <div key={idx} className="group relative p-8 bg-background border border-border hover:border-neon-green transition-all">
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 relative z-10">
                            <div className="flex-1 min-w-0 space-y-4">
                              <div className="flex items-center gap-3">
                                {badge && <span className="text-2xl">{badge.emoji}</span>}
                                <h3 className="text-xl font-black text-foreground group-hover:text-neon-green transition-colors leading-[0.9] uppercase tracking-tighter">
                                  <MarketTitle text={pos.market} />
                                </h3>
                                {/* Polymarket link button */}
                                <a
                                  href={polymarketUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-1.5 text-foreground/20 hover:text-neon-cyan transition-all opacity-0 group-hover:opacity-100"
                                  title={t('room_detail.view_on_polymarket', { defaultValue: 'View on Polymarket' })}
                                >
                                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                  </svg>
                                </a>
                              </div>
                              <div className="flex flex-wrap items-center gap-4">
                                <span className={`px-2 py-0.5 text-[9px] font-black uppercase tracking-widest ${pos.outcome.toLowerCase() === 'yes' ? 'bg-neon-green text-midnight-950' : 'bg-neon-red text-midnight-950'
                                  }`}>
                                  {pos.outcome.toLowerCase() === 'yes' ? t('common.yes') : t('common.no')}
                                </span>
                                <div className="text-[9px] font-black text-foreground/30 tracking-widest uppercase">
                                  <span className="text-foreground">{pos.totalShares.toLocaleString()}</span> {t('room_detail.shares')}
                                </div>
                              </div>
                              {/* Show holders */}
                              {pos.holders && pos.holders.length > 0 && (
                                <div className="flex flex-wrap items-center gap-2 mt-3">
                                  <span className="text-[9px] font-black text-foreground/30 uppercase tracking-widest">{t('room_detail.held_by')}</span>
                                  {pos.holders.map((holder, hIdx) => (
                                    <span
                                      key={hIdx}
                                      className="px-2 py-1 text-[9px] font-bold bg-muted border border-border text-neon-cyan truncate max-w-[120px]"
                                      title={`${holder.userName || formatAddress(holder.address)} - ${holder.shares.toLocaleString()} shares ($${holder.value.toLocaleString()})`}
                                    >
                                      {holder.userName || formatAddress(holder.address)}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>

                            <div className="flex items-center md:flex-col md:items-end gap-6 md:gap-2">
                              <div className="text-4xl font-mono font-black text-foreground tracking-tighter">
                                ${pos.totalValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    }))}
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex justify-between items-center mb-8 bg-muted p-4 border-l-2 border-neon-cyan">
                    <p className="text-[10px] font-bold text-neon-cyan uppercase tracking-widest">Live Activity Monitoring</p>
                    <span className="text-[10px] font-bold text-foreground/20 uppercase tracking-widest">
                      Last: {lastRefresh.toLocaleTimeString()}
                    </span>
                  </div>

                  <div className="space-y-4 font-mono">
                    {activities.length === 0 ? (
                      <div className="py-24 text-center">
                        <p className="text-xl font-black text-white/20 uppercase italic tracking-tighter">{t('room_detail.no_activity')}</p>
                      </div>
                    ) : (
                      groupActivities(activities, positions).map((group) => {
                        const isExpanded = expandedGroups.has(group.key);
                        const hasMultiple = group.activities.length > 1;
                        const totalCount = group.buyCount + group.sellCount;

                        // Filter based on volume
                        const min = minVolume ? parseFloat(minVolume) : 0;
                        const max = maxVolume ? parseFloat(maxVolume) : Infinity;
                        const groupTotal = group.totalBuyAmount + group.totalSellAmount;
                        if (groupTotal < min || groupTotal > max) return null;

                        const renderActivityCard = (act: Activity, isLatest: boolean = false, showBorder: boolean = true) => {
                          const isBuy = act.type === 'buy';
                          const isSell = act.type === 'sell';
                          const polymarketUrl = `https://polymarket.com/markets?_q=${encodeURIComponent(act.market)}`;
                          return (
                            <div className={`relative p-5 bg-background ${showBorder ? 'border border-border' : ''} hover:border-foreground/10 transition-all`}>
                              <div className="flex items-center justify-between gap-4">
                                <div className="flex items-center gap-6 flex-1 min-w-0">
                                  <div className={`w-10 h-10 flex items-center justify-center shrink-0 border skew-x-[-6deg] ${isBuy ? 'bg-neon-green/5 border-neon-green/30 text-neon-green' : isSell ? 'bg-neon-red/5 border-neon-red/30 text-neon-red' : 'bg-white/5 border-white/10 text-white/40'
                                    }`}>
                                    <div className="skew-x-[6deg]">
                                      {isBuy ? (
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M7 11l5-5m0 0l5 5m-5-5v12" /></svg>
                                      ) : isSell ? (
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M17 13l-5 5m0 0l-5-5m5 5V6" /></svg>
                                      ) : (
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                                      )}
                                    </div>
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2">
                                      <p className="text-xs font-black text-foreground mb-1 uppercase tracking-tighter truncate">
                                        <MarketTitle text={act.market} />
                                      </p>
                                      <a href={polymarketUrl} target="_blank" rel="noopener noreferrer" className="p-1 text-foreground/20 hover:text-neon-cyan transition-all opacity-0 group-hover:opacity-100" title={t('room_detail.view_on_polymarket', { defaultValue: 'View on Polymarket' })} onClick={(e) => e.stopPropagation()}>
                                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                                      </a>
                                    </div>
                                    <div className="flex items-center gap-3 text-[9px] font-black text-foreground/30 uppercase tracking-[0.2em]">
                                      <span className="text-foreground/60">{formatDisplayName(act)}</span>
                                      <span className="text-white/10">•</span>
                                      <span className={isBuy ? 'text-neon-green' : isSell ? 'text-neon-red' : ''}>
                                        {isBuy ? t('room_detail.type_buy') : isSell ? t('room_detail.type_sell') : act.type}
                                      </span>
                                      {act.outcome && (
                                        <>
                                          <span className="text-white/10">•</span>
                                          <span className="text-neon-cyan">{act.outcome}</span>
                                        </>
                                      )}
                                      <span className="text-white/10">•</span>
                                      <span className="text-foreground">${act.amount.toLocaleString()}</span>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-3">
                                  {isLatest && hasMultiple && (
                                    <span className="px-2 py-0.5 text-[8px] font-black bg-neon-cyan/20 text-neon-cyan uppercase tracking-widest">
                                      {t('room_detail.latest', { defaultValue: '最新' })}
                                    </span>
                                  )}
                                  <div className="text-[10px] font-bold text-foreground/20 uppercase tracking-widest">
                                    {formatTimestamp(act.timestamp, t)}
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        };

                        const renderSummary = () => (
                          <div className="flex items-center gap-4 px-5 py-3 bg-muted/50 border-t border-border text-[9px] font-black uppercase tracking-widest">
                            <span className="text-foreground/40">
                              {t('room_detail.total_transactions', { count: totalCount, defaultValue: `共 ${totalCount} 笔` })}
                            </span>
                            {group.buyCount > 0 && (
                              <>
                                <span className="text-white/10">|</span>
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
                                <span className="text-white/10">|</span>
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
                                <span className="text-white/10">|</span>
                                <span className="text-neon-cyan">
                                  持仓: ${group.positionValue.toLocaleString()}
                                </span>
                              </>
                            )}
                            {group.profitLoss !== null && (
                              <>
                                <span className="text-white/10">|</span>
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
                            <div key={group.key} className="group">
                              {renderActivityCard(group.latestActivity, false, true)}
                            </div>
                          );
                        }

                        // Multiple activities - render with grouping
                        return (
                          <div key={group.key} className="group">
                            {isExpanded ? (
                              // Expanded view
                              <div
                                onClick={() => toggleGroupExpanded(group.key)}
                                className="cursor-pointer border border-border hover:border-foreground/20 transition-all"
                              >
                                {group.activities.map((act, idx) => (
                                  <div key={idx} className={idx > 0 ? 'border-t border-border' : ''}>
                                    {renderActivityCard(act, idx === 0, false)}
                                  </div>
                                ))}
                                {renderSummary()}
                              </div>
                            ) : (
                              // Collapsed view with stacking effect
                              <div
                                onClick={() => toggleGroupExpanded(group.key)}
                                className="cursor-pointer relative"
                              >
                                {/* Stacking effect layers */}
                                <div className="absolute inset-0 bg-background border border-border translate-x-2 translate-y-2 opacity-30" />
                                {group.activities.length > 2 && (
                                  <div className="absolute inset-0 bg-background border border-border translate-x-1 translate-y-1 opacity-50" />
                                )}
                                {/* Main card */}
                                <div className="relative bg-background border border-border hover:border-foreground/20 transition-all">
                                  {renderActivityCard(group.latestActivity, false, false)}
                                  {renderSummary()}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
