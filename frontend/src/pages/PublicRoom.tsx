import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { roomService } from '../services/roomService';
import { activityService } from '../services/activityService';
import type { Room, Activity, Position } from '../services/roomService';
import { formatAddress, formatDisplayName, formatTimestamp, getRankBadge } from '../utils/formatting';

type Tab = 'positions' | 'activity';

export default function PublicRoom() {
  const { id } = useParams<{ id: string }>();
  const [room, setRoom] = useState<Room | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('positions');
  const navigate = useNavigate();

  useEffect(() => {
    loadRoom();
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

  if (loading) {
    return <LoadingSpinner fullScreen text="Accessing Open Protocol..." />;
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
          <h1 className="text-2xl font-black uppercase tracking-tighter mb-4 italic">Channel Locked</h1>
          <p className="text-white/40 mb-8 text-xs font-bold uppercase tracking-widest leading-relaxed">This data stream is either private or has been severed. Join the network for full access.</p>
          <Button onClick={() => navigate('/explore')} variant="primary" className="w-full">
            Return to Grid
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
                <span className="skew-x-[12deg]">Open Transmission</span>
              </div>
            </div>
            <h1 className="text-5xl font-display font-black uppercase tracking-tighter italic text-white">{room.name}</h1>
            <p className="text-sm font-bold text-white/40 uppercase tracking-widest leading-none">
              Monitoring {room.addresses?.length || 0} Open Targets
            </p>
          </div>

          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => navigate('/explore')} className="min-w-[160px]">
              Grid Archive
            </Button>
            <Button variant="primary" onClick={() => navigate('/register')} className="min-w-[160px] shadow-neon-green">
              Join Protocol
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-4 lg:sticky lg:top-24">
          <Card className="p-8 border-2 border-white/5 bg-midnight-900/80">
            <h2 className="text-xl font-black uppercase tracking-tighter mb-8 italic flex items-center gap-3">
              <span className="w-2 h-8 bg-white/20" />
              Stream Sources
            </h2>
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
              {room.addresses?.map((addr) => (
                <div key={addr.id} className="flex items-center gap-4 p-4 bg-midnight-950 border border-white/5">
                  <div className="w-10 h-10 bg-midnight-800 border border-white/5 flex items-center justify-center text-white/30 font-mono font-black text-xs skew-x-[-12deg]">
                    <span className="skew-x-[12deg]">{addr.address.slice(2, 4).toUpperCase()}</span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-mono font-black text-white/70 truncate">
                      {formatAddress(addr.address)}
                    </p>
                    <p className="text-[8px] font-black text-white/20 uppercase tracking-[0.2em] mt-1">Source: Verified</p>
                  </div>
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
                <span className="skew-x-[12deg]">Active Stakes</span>
              </button>
              <button
                onClick={() => setActiveTab('activity')}
                className={`flex items-center justify-center gap-3 py-4 text-xs font-black uppercase tracking-[0.2em] transition-all skew-x-[-12deg] ${activeTab === 'activity'
                  ? 'bg-neon-cyan text-midnight-950 shadow-neon-cyan'
                  : 'text-white/40 hover:text-white hover:bg-white/5'
                  }`}
              >
                <span className="skew-x-[12deg]">Recent Flux</span>
              </button>
            </div>

            <div className="p-8">
              {activeTab === 'positions' ? (
                <div className="space-y-6">
                  {positions.length === 0 ? (
                    <div className="py-24 text-center">
                      <p className="text-lg font-black text-white/20 uppercase italic tracking-tighter">Zero active stakes in this sector.</p>
                    </div>
                  ) : (
                    positions.map((pos, idx) => {
                      const badge = getRankBadge(idx);
                      const isGreen = pos.cashPnl >= 0;
                      return (
                        <div key={idx} className="group relative p-8 bg-midnight-950 border border-white/5 hover:border-neon-green/50 transition-all">
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                            <div className="flex-1 min-w-0 space-y-4">
                              <div className="flex items-center gap-3">
                                {badge && <span className="text-2xl">{badge.emoji}</span>}
                                <h3 className="text-xl font-black text-white group-hover:text-neon-green transition-colors leading-[0.9] uppercase tracking-tighter">
                                  {pos.market}
                                </h3>
                              </div>
                              <div className="flex items-center gap-4">
                                <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] ${pos.outcome.toLowerCase() === 'yes' ? 'bg-neon-green/20 text-neon-green border border-neon-green/30' : 'bg-neon-red/20 text-neon-red border border-neon-red/30'
                                  }`}>
                                  {pos.outcome}
                                </span>
                                <div className="flex items-center gap-2 text-[10px] font-black text-white/30 tracking-widest uppercase truncate max-w-[150px]">
                                  <span className="text-white">{pos.totalShares.toLocaleString()}</span> SHARES
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center md:flex-col md:items-end gap-6 md:gap-2">
                              <div className="text-3xl font-mono font-black text-white tracking-tighter">
                                ${pos.totalValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                              </div>
                              <div className={`inline-flex items-center gap-1.5 px-3 py-1 text-[10px] font-black uppercase tracking-widest ${isGreen ? 'text-neon-green' : 'text-neon-red'
                                }`}>
                                {isGreen ? '▲' : '▼'}
                                ${Math.abs(pos.cashPnl).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                <span className="opacity-50 ml-1">({isGreen ? '+' : ''}{pos.percentPnl.toFixed(1)}%)</span>
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
                      <p className="text-lg font-black text-white/20 uppercase italic tracking-tighter">Stream is currently static.</p>
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
                                <p className="text-xs font-black text-white mb-1 uppercase tracking-tighter truncate">{act.market}</p>
                                <div className="flex items-center gap-3 text-[8px] font-bold text-white/30 uppercase tracking-[0.2em]">
                                  <span className="text-white/60">{formatDisplayName(act)}</span>
                                  <span className="text-white/20">•</span>
                                  <span className={isBuy ? 'text-neon-green' : isSell ? 'text-neon-red' : ''}>{act.type}</span>
                                  <span className="text-white/20">•</span>
                                  <span className="text-white">${act.amount.toLocaleString()}</span>
                                </div>
                              </div>
                            </div>
                            <div className="text-[8px] font-bold text-white/10 uppercase tracking-widest pt-1">
                              {formatTimestamp(act.timestamp)}
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
