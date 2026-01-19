import { useState, useEffect, useCallback, useRef, useMemo, memo, lazy, Suspense } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth';
import LoadingSpinner from '../components/LoadingSpinner';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Linkify from '../components/ui/Linkify';
import PostInput from '../components/PostInput';
import MarketTitle from '../components/MarketTitle';
import RoomSocialLinks from '../components/RoomSocialLinks';
import AddressList from '../components/AddressList';
import ActivityGroup from '../components/ActivityGroup';
import { groupActivities as groupActivitiesUtil } from '../utils/groupActivities';
import { roomService } from '../services/roomService';
import { addressService } from '../services/addressService';
import { postService, type Post } from '../services/postService';
import {
  fetchActivitiesFromPolymarket,
  fetchPositionsFromPolymarket,
  fetchProfileNames,
  type Activity,
  type Position
} from '../services/polymarketDirect';
import { getRoomCache, setRoomCache } from '../services/roomCacheService';
import type { Room, Address } from '../services/roomService';
import { formatTimestamp, getRankBadge } from '../utils/formatting';

// Lazy load heavy PostCard component
const PostCard = lazy(() => import('../components/PostCard'));

const AUTO_REFRESH_INTERVAL = 120000; // 2 minutes

// Skeleton loader for posts section
const POSTS_SKELETON = (
  <div className="space-y-4">
    <div className="p-8 bg-card/50 border border-border animate-pulse rounded-lg" />
    <div className="p-8 bg-card/30 border border-border animate-pulse rounded-lg" />
  </div>
);

// Stable empty array for default addresses
const EMPTY_ADDRESSES: Address[] = [];
const EMPTY_ACTIVITIES: Activity[] = [];
const EMPTY_POSITIONS: Position[] = [];

interface RoomDetailProps {
  id?: string;
}

/**
 * RoomDetail page component with performance optimizations:
 * - Lazy loading for PostCard
 * - useMemo for expensive groupActivities calculation
 * - useCallback for event handlers to prevent unnecessary re-renders
 * - Extracted components for better code splitting
 */
function RoomDetail({ id: idProp }: RoomDetailProps) {
  const { id } = useParams<{ id: string }>();
  const roomId = idProp || id;
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [room, setRoom] = useState<Room | null>(null);
  const [activities, setActivities] = useState<Activity[]>(EMPTY_ACTIVITIES);
  const [positions, setPositions] = useState<Position[]>(EMPTY_POSITIONS);
  const [addressesWithProfiles, setAddressesWithProfiles] = useState<Address[]>(EMPTY_ADDRESSES);
  const [posts, setPosts] = useState<Post[]>([]);
  const [addressInput, setAddressInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);
  const [addError, setAddError] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [minVolume, setMinVolume] = useState<string>('');
  const [maxVolume, setMaxVolume] = useState<string>('');
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [showPositions, setShowPositions] = useState(false);
  const refreshTimerRef = useRef<number | null>(null);
  const positionsRef = useRef<HTMLDivElement>(null);

  // Use room.addresses as the source of truth for address count
  const displayAddresses = useMemo(() => {
    // If we have profile data, use it; otherwise use room.addresses
    if (addressesWithProfiles.length > 0) {
      return addressesWithProfiles;
    }
    return room?.addresses || EMPTY_ADDRESSES;
  }, [addressesWithProfiles, room]);

  // Define data loading functions first (before handlers that use them)
  const loadRoom = useCallback(async () => {
    if (!roomId) return;
    try {
      const data = await roomService.getRoom(roomId);
      setRoom(data);
    } catch (error) {
      console.error('Failed to load room:', error);
    } finally {
      setLoading(false);
    }
  }, [roomId]);

  const loadPosts = useCallback(async () => {
    if (!roomId) return;
    try {
      const data = await postService.getPosts(roomId);
      setPosts(data);
    } catch (error) {
      console.error('Failed to load posts:', error);
    }
  }, [roomId]);

  const loadAddressProfiles = useCallback(async (): Promise<Address[]> => {
    if (!roomId) return EMPTY_ADDRESSES;
    try {
      // First get addresses from our backend
      const data = await addressService.getAddresses(roomId);

      // Then fetch profile names directly from Polymarket
      const addressList = data.map((a: Address) => a.address);
      const profileNames = await fetchProfileNames(addressList);

      // Merge profile names with address data
      const addressesWithProfiles = data.map((addr: Address) => ({
        ...addr,
        userName: profileNames.get(addr.address.toLowerCase()) || null,
      }));

      setAddressesWithProfiles(addressesWithProfiles);
      return addressesWithProfiles;
    } catch (error) {
      console.error('Failed to load address profiles:', error);
      return EMPTY_ADDRESSES;
    }
  }, [roomId]);

  const loadActivities = useCallback(async (addressList: string[]): Promise<Activity[]> => {
    if (!roomId || addressList.length === 0) return EMPTY_ACTIVITIES;
    try {
      const data = await fetchActivitiesFromPolymarket(addressList);
      setActivities(data);
      return data;
    } catch (error) {
      console.error('Failed to load activities:', error);
      return EMPTY_ACTIVITIES;
    }
  }, [roomId]);

  const loadPositions = useCallback(async (addressList: string[]): Promise<Position[]> => {
    if (!roomId || addressList.length === 0) return EMPTY_POSITIONS;
    try {
      const data = await fetchPositionsFromPolymarket(addressList);
      setPositions(data);
      return data;
    } catch (error) {
      console.error('Failed to load positions:', error);
      return EMPTY_POSITIONS;
    }
  }, [roomId]);

  const refreshData = useCallback(async () => {
    if (!roomId) return;
    setIsRefreshing(true);
    try {
      // Get addresses from room data (source of truth)
      const currentAddresses = room?.addresses || [];
      if (currentAddresses.length === 0) {
        // If no addresses in room, try loading from backend
        const loadedAddresses = await addressService.getAddresses(roomId);
        if (loadedAddresses.length === 0) {
          setActivities(EMPTY_ACTIVITIES);
          setPositions(EMPTY_POSITIONS);
          setLastRefresh(new Date());
          return;
        }
      }

      // Load profile names for addresses
      const loadedAddresses = await loadAddressProfiles();
      const addressList = loadedAddresses.map(a => a.address);

      // Load positions and activities in parallel
      const [loadedPositions, loadedActivities] = await Promise.all([
        loadPositions(addressList),
        loadActivities(addressList),
      ]);

      // Save to cache
      setRoomCache(roomId, loadedAddresses, loadedActivities, loadedPositions);
      setLastRefresh(new Date());
    } finally {
      setIsRefreshing(false);
    }
  }, [roomId, room, loadAddressProfiles, loadPositions, loadActivities]);

  // Memoized event handlers to prevent unnecessary re-renders
  const toggleGroupExpanded = useCallback((key: string) => {
    setExpandedGroups(prev => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }, []);

  const handleCopyPublicLink = useCallback(() => {
    const link = `${window.location.origin}/public/${roomId}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [roomId]);

  const handleCopyAddress = useCallback((address: string) => {
    navigator.clipboard.writeText(address);
    setCopiedAddress(address);
    setTimeout(() => setCopiedAddress(null), 2000);
  }, []);

  const handleToggleVisibility = useCallback(async () => {
    if (!roomId) return;
    try {
      await roomService.toggleVisibility(roomId);
      loadRoom();
    } catch (error) {
      console.error('Failed to toggle visibility:', error);
    }
  }, [roomId, loadRoom]);

  const handleRemoveAddress = useCallback(async (addressId: string) => {
    if (!roomId) return;
    try {
      setIsDeleting(true);
      setDeletingId(addressId);
      await addressService.removeAddress(roomId, addressId);
      // Reload room data which includes updated addresses
      await loadRoom();
      // Clear the profile data temporarily to avoid flicker
      setAddressesWithProfiles(EMPTY_ADDRESSES);
      // Refresh activities and positions with new addresses
      await refreshData();
    } catch (error) {
      console.error('Failed to remove address:', error);
      // Reload room to restore state
      loadRoom();
    } finally {
      setIsDeleting(false);
      setDeletingId(null);
    }
  }, [roomId, loadRoom, refreshData]);

  const handleAddAddresses = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setAddError('');
    const addressList = addressInput.split(/[,\n]/).map(a => a.trim()).filter(a => a);
    if (!addressList.length) return;

    try {
      if (!roomId) {
        setAddError('Room ID is missing');
        return;
      }
      await addressService.addAddresses(roomId, addressList);
      setAddressInput('');
      // Reload room data which includes updated addresses
      await loadRoom();
      // Clear the profile data temporarily to avoid flicker
      setAddressesWithProfiles(EMPTY_ADDRESSES);
      // Refresh activities and positions with new addresses
      await refreshData();
    } catch (error: any) {
      setAddError(error.response?.data?.error || 'Failed to add address.');
    }
  }, [roomId, addressInput, loadRoom, refreshData]);

  const togglePositions = useCallback(() => {
    setShowPositions(prev => !prev);
  }, []);

  // Memoized groupActivities using shared utility
  const groupedActivities = useMemo(() => {
    const min = minVolume ? parseFloat(minVolume) : 0;
    const max = maxVolume ? parseFloat(maxVolume) : Infinity;
    const grouped = groupActivitiesUtil(activities, positions).filter((group) => {
      const total = group.totalBuyAmount + group.totalSellAmount;
      return total >= min && total <= max;
    });
    return grouped;
  }, [activities, positions, minVolume, maxVolume]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (positionsRef.current && !positionsRef.current.contains(event.target as Node)) {
        setShowPositions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Initial load with cache - optimized with async-parallel pattern
  useEffect(() => {
    if (!roomId) return;

    let isMounted = true;

    const initializeData = async () => {
      // First, try to load from cache for immediate display
      const cached = getRoomCache(roomId);
      if (cached && isMounted) {
        setAddressesWithProfiles(cached.addresses);
        setActivities(cached.activities);
        setPositions(cached.positions);
        setLastRefresh(new Date(cached.lastUpdated));
      }

      // Load room data first (contains addresses)
      const roomData = await roomService.getRoom(roomId);
      if (!isMounted) return;

      setRoom(roomData);
      setLoading(false);

      // Load posts
      loadPosts().catch(console.error);

      // If we have addresses, load their profiles and activities
      if (roomData.addresses && roomData.addresses.length > 0) {
        const addressList = roomData.addresses.map(a => a.address);

        // Load profile names
        try {
          const profileNames = await fetchProfileNames(addressList);
          if (isMounted) {
            const addressesWithProfiles = roomData.addresses.map(addr => ({
              ...addr,
              userName: profileNames.get(addr.address.toLowerCase()) || null,
            }));
            setAddressesWithProfiles(addressesWithProfiles);
          }
        } catch (e) {
          console.error('Failed to load profiles:', e);
          if (isMounted) {
            setAddressesWithProfiles(roomData.addresses);
          }
        }

        // Load activities and positions in parallel
        const [loadedActivities, loadedPositions] = await Promise.all([
          fetchActivitiesFromPolymarket(addressList),
          fetchPositionsFromPolymarket(addressList),
        ]);

        if (isMounted) {
          setActivities(loadedActivities);
          setPositions(loadedPositions);
          setRoomCache(roomId, roomData.addresses, loadedActivities, loadedPositions);
          setLastRefresh(new Date());
        }
      } else {
        // No addresses, clear data
        if (isMounted) {
          setActivities(EMPTY_ACTIVITIES);
          setPositions(EMPTY_POSITIONS);
          setAddressesWithProfiles(EMPTY_ADDRESSES);
        }
      }
    };

    initializeData().catch(console.error);

    return () => {
      isMounted = false;
    };
  }, [roomId]); // Only depend on roomId, not on other callbacks

  // Auto-refresh every 2 minutes
  useEffect(() => {
    if (!roomId) return;

    const doRefresh = async () => {
      try {
        setIsRefreshing(true);

        // Reload room to get fresh addresses
        const roomData = await roomService.getRoom(roomId);
        setRoom(roomData);

        if (roomData.addresses && roomData.addresses.length > 0) {
          const addressList = roomData.addresses.map(a => a.address);

          // Load profile names
          try {
            const profileNames = await fetchProfileNames(addressList);
            const addressesWithProfiles = roomData.addresses.map(addr => ({
              ...addr,
              userName: profileNames.get(addr.address.toLowerCase()) || null,
            }));
            setAddressesWithProfiles(addressesWithProfiles);
          } catch (e) {
            console.error('Failed to load profiles:', e);
            setAddressesWithProfiles(roomData.addresses);
          }

          // Load activities and positions in parallel
          const [loadedActivities, loadedPositions] = await Promise.all([
            fetchActivitiesFromPolymarket(addressList),
            fetchPositionsFromPolymarket(addressList),
          ]);

          setActivities(loadedActivities);
          setPositions(loadedPositions);
          setRoomCache(roomId, roomData.addresses, loadedActivities, loadedPositions);
        } else {
          setActivities(EMPTY_ACTIVITIES);
          setPositions(EMPTY_POSITIONS);
          setAddressesWithProfiles(EMPTY_ADDRESSES);
        }
      } catch (error) {
        console.error('[RoomDetail] Auto-refresh failed:', error);
      } finally {
        // Always update last refresh time and clear refreshing state
        setLastRefresh(new Date());
        setIsRefreshing(false);
      }
    };

    // Start the timer immediately when roomId is available
    refreshTimerRef.current = window.setInterval(doRefresh, AUTO_REFRESH_INTERVAL);

    return () => {
      if (refreshTimerRef.current) {
        clearInterval(refreshTimerRef.current);
      }
    };
  }, [roomId]); // Only depend on roomId, not room

  // Handle not found or loading state
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
          {/* Social Links - using extracted component */}
          <RoomSocialLinks
            twitterLink={room.twitterLink}
            telegramLink={room.telegramLink}
            discordLink={room.discordLink}
          />
          <div className="flex flex-wrap items-center gap-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-neon-green text-midnight-950 text-[10px] font-black uppercase tracking-widest skew-x-[-12deg]">
              <span className="skew-x-[12deg]">{displayAddresses.length} {t('room_detail.monitoring_targets')}</span>
            </div>
            <p className="text-[10px] font-bold text-foreground/30 uppercase tracking-widest">
              {t('room_detail.last_updated', { time: formatTimestamp(lastRefresh.toISOString(), t) })}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Collapsible Positions Dropdown */}
          <div className="relative" ref={positionsRef}>
            <button
              onClick={togglePositions}
              className={`flex items-center gap-2 px-4 py-2.5 border text-[10px] font-black uppercase tracking-widest transition-all ${
                showPositions
                  ? 'bg-neon-green text-midnight-950 border-neon-green'
                  : 'bg-muted text-foreground/60 border-border hover:border-neon-green hover:text-neon-green'
              }`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2v-14a2 2 0 00-2 2h-2a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              <span>{t('room_detail.tabs.positions')}</span>
              <span className="px-1.5 py-0.5 bg-white/10 text-[8px]">{positions.length}</span>
              <svg className={`w-3 h-3 transition-transform ${showPositions ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Positions Dropdown Panel */}
            {showPositions && (
              <div className="absolute left-0 top-full mt-2 w-[500px] bg-card border border-border shadow-2xl z-50 animate-fade-in">
                <div className="p-4 border-b border-border">
                  <h3 className="text-xs font-black uppercase tracking-widest text-foreground/60">
                    {t('room_detail.tabs.positions')}
                  </h3>
                </div>
                <div className="max-h-[400px] overflow-y-auto custom-scrollbar p-4 space-y-3">
                  {positions.length === 0 ? (
                    <div className="py-8 text-center">
                      <p className="text-sm font-black text-foreground/20 uppercase italic tracking-tighter">{t('room_detail.no_positions')}</p>
                    </div>
                  ) : (
                    positions.map((pos, idx) => {
                      const badge = getRankBadge(idx);
                      return (
                        <div key={idx} className="p-4 bg-background border border-border hover:border-neon-green/50 transition-all">
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              {badge && <span className="text-lg">{badge.emoji}</span>}
                              <h4 className="text-sm font-black text-foreground uppercase tracking-tighter truncate">
                                <MarketTitle text={pos.market} />
                              </h4>
                            </div>
                            <div className="text-xl font-mono font-black text-neon-green">
                              ${pos.totalValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
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

          <Button variant="cyber" onClick={handleToggleVisibility} className="min-w-[160px]">
            {room.isPublic ? t('room_detail.make_private') : t('room_detail.make_public')}
          </Button>
          {room.isPublic && (
            <Button variant="primary" onClick={handleCopyPublicLink} className="min-w-[160px]">
              {copied ? t('room_detail.link_copied') : t('room_detail.share_link')}
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Sidebar - Addresses */}
        <div className="lg:col-span-4 space-y-8">
          {/* Post Input for Room Owner */}
          <PostInput roomId={roomId!} onPostCreated={loadPosts} />

          <Card className="p-8 border-border bg-card/50">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-black uppercase tracking-tighter mb-8 italic flex items-center gap-3">
                <span className="w-2 h-8 bg-neon-cyan/20" />
                {t('room_detail.addresses')}
              </h2>
              <span className="text-[10px] font-mono text-neon-cyan/50">{displayAddresses.length}/50</span>
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

            {/* Address List - using extracted component */}
            <AddressList
              addresses={displayAddresses}
              onCopy={handleCopyAddress}
              onRemove={handleRemoveAddress}
              copiedAddress={copiedAddress}
              isDeleting={isDeleting}
              deletingId={deletingId ?? undefined}
            />
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

              <div className="space-y-6">
                {/* Owner Posts - lazy loaded */}
                {posts.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 px-3 py-1 bg-neon-cyan/20 border border-neon-cyan/30">
                      <svg className="w-4 h-4 text-neon-cyan" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002 2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      <span className="text-[10px] font-black text-neon-cyan uppercase tracking-widest">
                        {t('room_detail.announcements', { defaultValue: '群主公告' })}
                      </span>
                    </div>
                    <Suspense fallback={POSTS_SKELETON}>
                      {posts.map((post) => (
                        <PostCard
                          key={post.id}
                          post={post}
                          isOwner={user?.id === room?.userId}
                          onPostDeleted={loadPosts}
                          onCommentAdded={loadPosts}
                        />
                      ))}
                    </Suspense>
                  </div>
                )}

                {/* Live Activity Monitoring */}
                <div className="flex justify-between items-center mb-8 bg-muted p-4 border-l-2 border-neon-cyan">
                  <p className="text-[10px] font-bold text-neon-cyan uppercase tracking-widest">Live Activity Monitoring</p>
                  <span className="text-[10px] font-bold text-foreground/20 uppercase tracking-widest">
                    Last: {lastRefresh.toLocaleTimeString()}
                  </span>
                </div>

                {/* Activities - using extracted ActivityGroup component */}
                <div className="space-y-4 font-mono">
                  {displayAddresses.length === 0 ? (
                    <div className="py-16 text-center border-2 border-dashed border-border rounded-lg">
                      <svg className="w-16 h-16 mx-auto mb-4 text-foreground/10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      <p className="text-sm font-bold text-foreground/40 uppercase tracking-wider mb-2">{t('room_detail.no_addresses_hint', { defaultValue: 'Add wallet addresses to start monitoring their trading activity' })}</p>
                      <p className="text-xs text-foreground/20">{t('room_detail.add_addresses_below', { defaultValue: 'Use the form on the left to add addresses' })}</p>
                    </div>
                  ) : activities.length === 0 ? (
                    <div className="py-24 text-center">
                      <p className="text-xl font-black text-white/20 uppercase italic tracking-tighter">{t('room_detail.no_activity')}</p>
                      <p className="text-sm text-foreground/30 mt-2">{t('room_detail.no_activity_hint', { defaultValue: 'No recent trading activity found for monitored addresses' })}</p>
                    </div>
                  ) : groupedActivities.length === 0 ? (
                    <div className="py-16 text-center border-2 border-dashed border-border rounded-lg">
                      <p className="text-sm font-bold text-foreground/40 uppercase tracking-wider mb-2">{t('room_detail.no_activity_after_filter', { defaultValue: 'No activities match your filter criteria' })}</p>
                      {(minVolume || maxVolume) && (
                        <button
                          onClick={() => { setMinVolume(''); setMaxVolume(''); }}
                          className="text-xs text-neon-cyan hover:text-neon-cyan/80 underline"
                        >
                          {t('room_detail.clear_filter', { defaultValue: 'Clear filters' })}
                        </button>
                      )}
                    </div>
                  ) : (
                    groupedActivities.map((group) => (
                      <ActivityGroup
                        key={group.key}
                        group={group}
                        isExpanded={expandedGroups.has(group.key)}
                        minVolume={minVolume ? parseFloat(minVolume) : undefined}
                        maxVolume={maxVolume ? parseFloat(maxVolume) : undefined}
                        onToggle={toggleGroupExpanded}
                      />
                    ))
                  )}
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default memo(RoomDetail, (prevProps, nextProps) => {
  return prevProps.id === nextProps.id;
});
