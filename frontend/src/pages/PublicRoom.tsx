import { useState, useEffect } from 'react';
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
import type { Room, Address } from '../services/roomService';
import { formatAddress, formatDisplayName, formatTimestamp, getRankBadge } from '../utils/formatting';

function MarketTitle({ text }: { text: string }) {
  const translated = useTranslate(text);
  return <>{translated}</>;
}

type Tab = 'positions' | 'activity';

export default function PublicRoom() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const [room, setRoom] = useState<Room | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('positions');
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadRoom();
    loadAddressProfiles();
    loadActivities();
    loadPositions();
  }, [id]);

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

  const loadAddressProfiles = async () => {
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
    } catch (error) {
      console.error('Failed to load address profiles:', error);
    }
  };

  const loadActivities = async () => {
    try {
      // Get addresses first
      const addressList = addresses.length > 0
        ? addresses.map(a => a.address)
        : (await addressService.getAddresses(id!)).map((a: Address) => a.address);

      // Fetch activities directly from Polymarket
      const data = await fetchActivitiesFromPolymarket(addressList);
      setActivities(data);
    } catch (error) {
      console.error('Failed to load activities:', error);
    }
  };

  const loadPositions = async () => {
    try {
      // Get addresses first
      const addressList = addresses.length > 0
        ? addresses.map(a => a.address)
        : (await addressService.getAddresses(id!)).map((a: Address) => a.address);

      // Fetch positions directly from Polymarket
      const data = await fetchPositionsFromPolymarket(addressList);
      setPositions(data);
    } catch (error) {
      console.error('Failed to load positions:', error);
    }
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
      <div className="flex-1 flex items-center justify-center p-6 bg-midnight-950">
        <Card variant="neon-red" className="p-12 text-center max-w-sm border-2 border-neon-red shadow-neon-red">
          <div className="text-neon-red mb-6 animate-glitch">
            <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-2xl font-black uppercase tracking-tighter mb-4 italic">{t('room_detail.locked_title')}</h1>
          <p className="text-white/40 mb-8 text-xs font-bold uppercase tracking-widest leading-relaxed">{t('room_detail.locked_desc')}</p>
          <Button onClick={() => navigate('/explore')} variant="primary" className="w-full">
            {t('room_detail.grid_archive')}
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
      {/* Header */}
      <div className="mb-16 animate-fade-in border-l-4 border-neon-green pl-6 py-2">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="px-3 py-1 bg-neon-green text-midnight-950 text-[10px] font-black uppercase tracking-widest skew-x-[-12deg]">
                <span className="skew-x-[12deg]">{t('room_detail.open_transmission')}</span>
              </div>
            </div>
            <h1 className="text-5xl font-display font-black uppercase tracking-tighter italic text-white">{room.name}</h1>
            <p className="text-sm font-bold text-white/40 uppercase tracking-widest leading-none">
              {t('room_detail.monitoring_targets_public', { count: addresses.length || room.addresses?.length || 0 })}
            </p>
          </div>

          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => navigate('/explore')} className="min-w-[160px]">
              {t('room_detail.grid_archive')}
            </Button>
            <Button variant="primary" onClick={() => navigate('/register')} className="min-w-[160px] shadow-neon-green">
              {t('nav.register')}
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-4 lg:sticky lg:top-24">
          <Card className="p-8 border-2 border-white/5 bg-midnight-900/80">
            <h2 className="text-xl font-black uppercase tracking-tighter mb-8 italic flex items-center gap-3">
              <span className="w-2 h-8 bg-white/20" />
              {t('room_detail.stream_sources')}
            </h2>
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
              {addresses.map((addr) => (
                <div key={addr.id} className="group flex items-center gap-4 p-4 bg-midnight-950 border border-white/5 hover:border-white/10 transition-all">
                  <div className="w-10 h-10 bg-midnight-800 border border-white/5 flex items-center justify-center text-white/30 font-mono font-black text-xs skew-x-[-12deg] shrink-0">
                    <span className="skew-x-[12deg]">{addr.address.slice(2, 4).toUpperCase()}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    {addr.userName ? (
                      <>
                        <p className="text-xs font-bold text-white/70 truncate">{addr.userName}</p>
                        <p className="text-[10px] font-mono text-white/30 truncate">{formatAddress(addr.address)}</p>
                      </>
                    ) : (
                      <>
                        <p className="text-xs font-mono font-black text-white/70 truncate">
                          {formatAddress(addr.address)}
                        </p>
                        <p className="text-[8px] font-black text-white/20 uppercase tracking-[0.2em] mt-1">{t('room_detail.source_verified')}</p>
                      </>
                    )}
                  </div>
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
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="lg:col-span-8">
          <Card className="border-2 border-white/5 bg-midnight-900/80 overflow-hidden">
            <div className="grid grid-cols-2 bg-midnight-950 p-2 border-b border-white/5">
              <button
                onClick={() => setActiveTab('positions')}
                className={`flex items-center justify-center gap-3 py-4 text-xs font-black uppercase tracking-[0.2em] transition-all skew-x-[-12deg] ${activeTab === 'positions'
                  ? 'bg-neon-green text-midnight-950 shadow-neon-green'
                  : 'text-white/40 hover:text-white hover:bg-white/5'
                  }`}
              >
                <span className="skew-x-[12deg]">{t('room_detail.active_stakes')}</span>
              </button>
              <button
                onClick={() => setActiveTab('activity')}
                className={`flex items-center justify-center gap-3 py-4 text-xs font-black uppercase tracking-[0.2em] transition-all skew-x-[-12deg] ${activeTab === 'activity'
                  ? 'bg-neon-cyan text-midnight-950 shadow-neon-cyan'
                  : 'text-white/40 hover:text-white hover:bg-white/5'
                  }`}
              >
                <span className="skew-x-[12deg]">{t('room_detail.recent_flux')}</span>
              </button>
            </div>

            <div className="p-8">
              {activeTab === 'positions' ? (
                <div className="space-y-6">
                  {positions.length === 0 ? (
                    <div className="py-24 text-center">
                      <p className="text-lg font-black text-white/20 uppercase italic tracking-tighter">{t('room_detail.zero_stakes')}</p>
                    </div>
                  ) : (
                    positions.map((pos, idx) => {
                      const badge = getRankBadge(idx);
                      return (
                        <div key={idx} className="group relative p-8 bg-midnight-950 border border-white/5 hover:border-neon-green/50 transition-all">
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                            <div className="flex-1 min-w-0 space-y-4">
                              <div className="flex items-center gap-3">
                                {badge && <span className="text-2xl">{badge.emoji}</span>}
                                <h3 className="text-xl font-black text-white group-hover:text-neon-green transition-colors leading-[0.9] uppercase tracking-tighter">
                                  <MarketTitle text={pos.market} />
                                </h3>
                              </div>
                              <div className="flex items-center gap-4">
                                <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] ${pos.outcome.toLowerCase() === 'yes' ? 'bg-neon-green/20 text-neon-green border border-neon-green/30' : 'bg-neon-red/20 text-neon-red border border-neon-red/30'
                                  }`}>
                                  {pos.outcome.toLowerCase() === 'yes' ? t('common.yes') : t('common.no')}
                                </span>
                                <div className="flex items-center gap-2 text-[10px] font-black text-white/30 tracking-widest uppercase truncate max-w-[150px]">
                                  <span className="text-white">{pos.totalShares.toLocaleString()}</span> {t('room_detail.shares')}
                                </div>
                              </div>
                              {/* Show holders */}
                              {pos.holders && pos.holders.length > 0 && (
                                <div className="flex flex-wrap items-center gap-2 mt-3">
                                  <span className="text-[9px] font-bold text-white/30 uppercase tracking-widest">{t('room_detail.held_by')}</span>
                                  {pos.holders.map((holder, hIdx) => (
                                    <span
                                      key={hIdx}
                                      className="px-2 py-1 text-[9px] font-bold bg-midnight-800 border border-white/10 text-neon-cyan truncate max-w-[120px]"
                                      title={`${holder.userName || formatAddress(holder.address)} - ${holder.shares.toLocaleString()} shares ($${holder.value.toLocaleString()})`}
                                    >
                                      {holder.userName || formatAddress(holder.address)}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>

                            <div className="flex items-center md:flex-col md:items-end gap-6 md:gap-2">
                              <div className="text-3xl font-mono font-black text-white tracking-tighter">
                                ${pos.totalValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    }))}
                </div>
              ) : (
                <div className="space-y-6 font-mono">
                  {activities.length === 0 ? (
                    <div className="py-24 text-center">
                      <p className="text-lg font-black text-white/20 uppercase italic tracking-tighter">{t('room_detail.stream_static')}</p>
                    </div>
                  ) : (
                    activities.map((act, idx) => {
                      const isBuy = act.type === 'buy';
                      const isSell = act.type === 'sell';
                      return (
                        <div key={idx} className="relative p-5 bg-midnight-950 border border-white/5 hover:border-white/10 group transition-all">
                          <div className="flex items-center justify-between gap-6">
                            <div className="flex items-center gap-4 flex-1 min-w-0">
                              <div className={`w-10 h-10 border skew-x-[-12deg] flex items-center justify-center shrink-0 ${isBuy ? 'border-neon-green/30 text-neon-green bg-neon-green/5' : isSell ? 'border-neon-red/30 text-neon-red bg-neon-red/5' : 'border-white/10 text-white/20 bg-white/5'
                                }`}>
                                <div className="skew-x-[12deg]">
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
                                <p className="text-xs font-black text-white mb-1 uppercase tracking-tighter truncate">
                                  <MarketTitle text={act.market} />
                                </p>
                                <div className="flex items-center gap-3 text-[8px] font-bold text-white/30 uppercase tracking-[0.2em]">
                                  <span className="text-white/60">{formatDisplayName(act)}</span>
                                  <span className="text-white/20">•</span>
                                  <span className={isBuy ? 'text-neon-green' : isSell ? 'text-neon-red' : ''}>
                                    {isBuy ? t('room_detail.type_buy') : isSell ? t('room_detail.type_sell') : act.type}
                                  </span>
                                  <span className="text-white/20">•</span>
                                  <span className="text-white">${act.amount.toLocaleString()}</span>
                                </div>
                              </div>
                            </div>
                            <div className="text-[8px] font-bold text-white/10 uppercase tracking-widest pt-1">
                              {formatTimestamp(act.timestamp, t)}
                            </div>
                          </div>
                        </div>
                      );
                    }))}
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
