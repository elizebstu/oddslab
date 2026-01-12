import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { roomService } from '../services/roomService';
import { addressService } from '../services/addressService';
import { activityService } from '../services/activityService';
import type { Room, Activity, Position } from '../services/roomService';
import { formatAddress, formatDisplayName, formatTimestamp, getRankBadge } from '../utils/formatting';

type TabType = 'positions' | 'activities';

export default function RoomDetail() {
  const { id } = useParams<{ id: string }>();
  const [room, setRoom] = useState<Room | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [addressInput, setAddressInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [addError, setAddError] = useState('');
  const [activeTab, setActiveTab] = useState<TabType>('positions');
  const navigate = useNavigate();

  useEffect(() => {
    loadRoom();
    loadPositions();
    loadActivities();
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

  const loadActivities = async () => {
    try {
      const data = await activityService.getActivities(id!);
      setActivities(data);
    } catch (error) {
      console.error('Failed to load activities:', error);
    }
  };

  const loadPositions = async () => {
    try {
      const data = await activityService.getPositions(id!);
      setPositions(data);
    } catch (error) {
      console.error('Failed to load positions:', error);
    }
  };

  const handleAddAddresses = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddError('');
    const addresses = addressInput.split(/[,\n]/).map(a => a.trim()).filter(a => a);
    try {
      await addressService.addAddresses(id!, addresses);
      setAddressInput('');
      loadRoom();
      loadActivities();
      loadPositions();
    } catch (error: any) {
      setAddError(error.response?.data?.error || 'Failed to add address.');
    }
  };

  const handleRemoveAddress = async (addressId: string) => {
    try {
      await addressService.removeAddress(id!, addressId);
      loadRoom();
      loadActivities();
      loadPositions();
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

  if (loading) {
    return <LoadingSpinner fullScreen text="Loading Room..." />;
  }

  if (!room) {
    return (
      <div className="flex-1 flex items-center justify-center p-6 bg-midnight-950">
        <Card variant="neon-red" className="p-12 text-center max-w-sm border-2 border-neon-red shadow-neon-red">
          <div className="text-neon-red mb-6 animate-glitch">
            <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-2xl font-black uppercase tracking-tighter mb-4 italic">Room Not Found</h1>
          <p className="text-white/40 mb-8 text-xs font-bold uppercase tracking-widest">This room does not exist or has been deleted.</p>
          <Button onClick={() => navigate('/dashboard')} variant="danger" className="w-full">
            Back to Dashboard
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
            className="group flex items-center text-[10px] font-bold text-white/30 hover:text-neon-cyan transition-colors uppercase tracking-widest"
          >
            <svg className="w-3 h-3 mr-2 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" /></svg>
            Back to Dashboard
          </button>

          <div className="flex items-center gap-4">
            <h1 className="text-4xl md:text-5xl font-display font-black uppercase tracking-tighter italic text-white">{room.name}</h1>
            {room.isPublic && (
              <div className="px-3 py-1 bg-neon-green text-midnight-950 text-[10px] font-black uppercase tracking-widest skew-x-[-6deg]">
                <span className="skew-x-[6deg] inline-block">Public Room</span>
              </div>
            )}
          </div>
          <p className="text-sm font-bold text-white/40 uppercase tracking-widest leading-none">
            Tracking {room.addresses?.length || 0} Addresses
          </p>
        </div>

        <div className="flex items-center gap-4">
          <Button variant="cyber" onClick={handleToggleVisibility} className="min-w-[160px]">
            {room.isPublic ? 'Make Private' : 'Make Public'}
          </Button>
          {room.isPublic && (
            <Button variant="primary" onClick={copyPublicLink} className="min-w-[160px]">
              {copied ? 'Link Copied' : 'Share Link'}
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Sidebar - Addresses */}
        <div className="lg:col-span-4 space-y-8">
          <Card className="p-8 border-white/10 bg-midnight-900/50">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-black uppercase tracking-tighter italic flex items-center gap-3 text-white">
                <span className="w-2 h-8 bg-neon-cyan" />
                Addresses
              </h2>
              <span className="text-[10px] font-mono text-neon-cyan/50">{room.addresses?.length}/50</span>
            </div>

            <form onSubmit={handleAddAddresses} className="space-y-4 mb-10">
              <textarea
                value={addressInput}
                onChange={(e) => setAddressInput(e.target.value)}
                placeholder="Paste wallet addresses or usernames..."
                className="w-full min-h-[120px] p-4 bg-midnight-950 border border-white/10 focus:border-neon-cyan outline-none font-mono text-xs text-white placeholder:text-white/20 transition-all"
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
              {room.addresses?.map((addr) => (
                <div key={addr.id} className="group relative flex justify-between items-center p-4 bg-midnight-950 border border-white/5 hover:border-white/20 transition-all">
                  <div className="flex items-center gap-4 overflow-hidden">
                    <div className="w-9 h-9 bg-midnight-800 border border-white/10 flex items-center justify-center text-neon-cyan font-mono font-bold text-[10px] skew-x-[-6deg]">
                      <span className="skew-x-[6deg]">{addr.address.slice(2, 4).toUpperCase()}</span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-mono font-bold text-white truncate">{formatAddress(addr.address)}</p>
                      <p className="text-[8px] font-bold text-white/20 uppercase tracking-[0.2em] mt-1">Monitoring</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemoveAddress(addr.id)}
                    className="p-2 text-white/20 hover:text-neon-red transition-all opacity-0 group-hover:opacity-100"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Main Feed */}
        <div className="lg:col-span-8">
          <Card className="border-white/10 bg-midnight-900/50 backdrop-blur-md overflow-hidden">
            <div className="grid grid-cols-2 bg-midnight-950 p-2 border-b border-white/10">
              <button
                onClick={() => setActiveTab('positions')}
                className={`flex items-center justify-center gap-3 py-4 text-xs font-bold uppercase tracking-widest transition-all skew-x-[-6deg] ${activeTab === 'positions'
                  ? 'bg-neon-green text-midnight-950'
                  : 'text-white/40 hover:text-white'
                  }`}
              >
                <span className="skew-x-[6deg]">Positions</span>
              </button>
              <button
                onClick={() => setActiveTab('activities')}
                className={`flex items-center justify-center gap-3 py-4 text-xs font-bold uppercase tracking-widest transition-all skew-x-[-6deg] ${activeTab === 'activities'
                  ? 'bg-neon-cyan text-midnight-950'
                  : 'text-white/40 hover:text-white'
                  }`}
              >
                <span className="skew-x-[6deg]">Activity Feed</span>
              </button>
            </div>

            <div className="p-8">
              {activeTab === 'positions' ? (
                <div className="space-y-6">
                  {positions.length === 0 ? (
                    <div className="py-32 text-center">
                      <p className="text-xl font-black text-white/20 uppercase italic tracking-tighter">No active positions found.</p>
                    </div>
                  ) : (
                    positions.map((pos, idx) => {
                      const badge = getRankBadge(idx);
                      const isGreen = pos.cashPnl >= 0;
                      return (
                        <div key={idx} className="group relative p-8 bg-midnight-950 border border-white/5 hover:border-neon-green transition-all">
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 relative z-10">
                            <div className="flex-1 min-w-0 space-y-4">
                              <div className="flex items-center gap-3">
                                {badge && <span className="text-2xl">{badge.emoji}</span>}
                                <h3 className="text-xl font-black text-white group-hover:text-neon-green transition-colors leading-[0.9] uppercase tracking-tighter">
                                  {pos.market}
                                </h3>
                              </div>
                              <div className="flex flex-wrap items-center gap-4">
                                <span className={`px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest ${pos.outcome.toLowerCase() === 'yes' ? 'bg-neon-green text-midnight-950' : 'bg-neon-red text-midnight-950'
                                  }`}>
                                  {pos.outcome}
                                </span>
                                <div className="text-[9px] font-bold text-white/30 tracking-widest uppercase">
                                  <span className="text-white">{pos.totalShares.toLocaleString()}</span> SHARES
                                </div>
                                <div className="text-[9px] font-bold text-white/30 tracking-widest uppercase">
                                  ENTRY: <span className="text-white">{(pos.avgPrice * 100).toFixed(1)}¢</span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center md:flex-col md:items-end gap-6 md:gap-2">
                              <div className="text-4xl font-mono font-black text-white tracking-tighter">
                                ${pos.totalValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                              </div>
                              <div className={`inline-flex items-center gap-1 px-3 py-1 text-[10px] font-bold uppercase tracking-widest ${isGreen ? 'text-neon-green bg-neon-green/10 border border-neon-green/20' : 'text-neon-red bg-neon-red/10 border border-neon-red/20'
                                }`}>
                                {isGreen ? '▲' : '▼'}
                                ${Math.abs(pos.cashPnl).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                <span className="opacity-50 ml-1">({isGreen ? '+' : ''}{pos.percentPnl.toFixed(1)}%)</span>
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
                  <div className="flex justify-between items-center mb-8 bg-midnight-950 p-4 border-l-2 border-neon-cyan">
                    <p className="text-[10px] font-bold text-neon-cyan uppercase tracking-widest">Live Activity Monitoring</p>
                    <button onClick={loadActivities} className="text-[10px] font-bold text-white/20 hover:text-white uppercase tracking-widest flex items-center gap-2 transition-colors">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                      Refresh
                    </button>
                  </div>

                  <div className="space-y-4 font-mono">
                    {activities.length === 0 ? (
                      <p className="text-center py-20 text-white/20 uppercase font-bold tracking-widest italic">No activity found.</p>
                    ) : (
                      activities.map((act, idx) => {
                        const isBuy = act.type === 'buy';
                        const isSell = act.type === 'sell';
                        return (
                          <div key={idx} className="relative p-5 bg-midnight-950 border border-white/5 hover:border-white/10 group transition-all">
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
                                  <p className="text-sm font-bold text-white mb-1 uppercase tracking-tight truncate group-hover:text-neon-cyan transition-colors">{act.market}</p>
                                  <div className="flex items-center gap-3 text-[9px] font-bold text-white/30 uppercase tracking-[0.1em]">
                                    <span className="text-neon-cyan">{formatDisplayName(act)}</span>
                                    <span className="text-white/10">•</span>
                                    <span className={isBuy ? 'text-neon-green' : isSell ? 'text-neon-red' : ''}>{act.type}</span>
                                    <span className="text-white/10">•</span>
                                    <span className="text-white">${act.amount.toLocaleString()}</span>
                                  </div>
                                </div>
                              </div>
                              <div className="text-[9px] font-bold text-white/20 whitespace-nowrap">
                                {formatTimestamp(act.timestamp)}
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
