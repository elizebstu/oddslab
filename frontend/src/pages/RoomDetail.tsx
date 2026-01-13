import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useTranslate } from '../hooks/useTranslate';
import LoadingSpinner from '../components/LoadingSpinner';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
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
  const refreshTimerRef = useRef<number | null>(null);

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
              {activeTab === 'positions' ? (
                <div className="space-y-6">
                  {positions.length === 0 ? (
                    <div className="py-32 text-center">
                      <p className="text-xl font-black text-white/20 uppercase italic tracking-tighter">{t('room_detail.no_positions')}</p>
                    </div>
                  ) : (
                    positions.map((pos, idx) => {
                      const badge = getRankBadge(idx);
                      return (
                        <div key={idx} className="group relative p-8 bg-background border border-border hover:border-neon-green transition-all">
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 relative z-10">
                            <div className="flex-1 min-w-0 space-y-4">
                              <div className="flex items-center gap-3">
                                {badge && <span className="text-2xl">{badge.emoji}</span>}
                                <h3 className="text-xl font-black text-foreground group-hover:text-neon-green transition-colors leading-[0.9] uppercase tracking-tighter">
                                  <MarketTitle text={pos.market} />
                                </h3>
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
                    })
                  )}
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
                      activities.map((act, idx) => {
                        const isBuy = act.type === 'buy';
                        const isSell = act.type === 'sell';
                        return (
                          <div key={idx} className="relative p-5 bg-background border border-border hover:border-foreground/10 group transition-all">
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
                                <div className="min-w-0">
                                  <p className="text-xs font-black text-foreground mb-1 uppercase tracking-tighter truncate">
                                    <MarketTitle text={act.market} />
                                  </p>
                                  <div className="flex items-center gap-3 text-[9px] font-black text-foreground/30 uppercase tracking-[0.2em]">
                                    <span className="text-foreground/60">{formatDisplayName(act)}</span>
                                    <span className="text-white/10">•</span>
                                    <span className={isBuy ? 'text-neon-green' : isSell ? 'text-neon-red' : ''}>
                                      {isBuy ? t('room_detail.type_buy') : isSell ? t('room_detail.type_sell') : act.type}
                                    </span>
                                    <span className="text-white/10">•</span>
                                    <span className="text-foreground">${act.amount.toLocaleString()}</span>
                                  </div>
                                </div>
                              </div>
                              <div className="text-[10px] font-bold text-foreground/20 uppercase tracking-widest pt-1">
                                {formatTimestamp(act.timestamp, t)}
                              </div>
                            </div>
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
