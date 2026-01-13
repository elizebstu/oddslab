import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import RoomCard from '../components/RoomCard';
import LoadingSpinner from '../components/LoadingSpinner';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import { roomService } from '../services/roomService';
import { fetchActivitiesFromPolymarket, type Activity, fetchProfileNames } from '../services/polymarketDirect';
import { useTranslate } from '../hooks/useTranslate';
import { formatDisplayName, formatTimestamp } from '../utils/formatting';
import type { Room } from '../services/roomService';

function MarketTitle({ text }: { text: string }) {
  const translated = useTranslate(text);
  return <>{translated}</>;
}

export default function Dashboard() {
  const { t } = useTranslation();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [roomName, setRoomName] = useState('');
  const [creating, setCreating] = useState(false);
  const [activeTab, setActiveTab] = useState<'rooms' | 'feed'>('rooms');
  const [globalActivities, setGlobalActivities] = useState<Activity[]>([]);
  const [feedLoading, setFeedLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadRooms();
  }, []);

  useEffect(() => {
    if (activeTab === 'feed' && globalActivities.length === 0) {
      loadGlobalFeed();
    }
  }, [activeTab]);

  const loadRooms = async () => {
    try {
      const data = await roomService.getRooms();
      setRooms(data);
    } catch (error) {
      console.error('Failed to load rooms:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setCreating(true);
    try {
      await roomService.createRoom(roomName);
      setRoomName('');
      setShowModal(false);
      loadRooms();
    } catch (error) {
      console.error('Failed to create room:', error);
      setError(t('dashboard.modal_error'));
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteRoom = async (id: string) => {
    if (!confirm(t('common.confirm_delete', { defaultValue: 'Are you sure you want to delete this room? This cannot be undone.' }))) return;
    try {
      await roomService.deleteRoom(id);
      loadRooms();
    } catch (error) {
      console.error('Failed to delete room:', error);
    }
  };

  const loadGlobalFeed = async () => {
    setFeedLoading(true);
    try {
      const allRooms = rooms.length > 0 ? rooms : await roomService.getRooms();
      const allAddresses = Array.from(new Set(allRooms.flatMap(r => r.addresses || []).map(a => a.address)));

      if (allAddresses.length === 0) {
        setGlobalActivities([]);
        return;
      }

      const activities = await fetchActivitiesFromPolymarket(allAddresses);
      setGlobalActivities(activities);
    } catch (error) {
      console.error('Failed to load global feed:', error);
    } finally {
      setFeedLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen text={t('common.loading')} />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 relative animate-fade-in">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 mb-16 border-l-4 border-neon-cyan pl-6 py-2">
        <div className="space-y-1">
          <h1 className="text-4xl md:text-5xl font-display font-black uppercase tracking-tighter italic text-foreground">
            {t('dashboard.title')}<span className="text-neon-cyan glow-text-cyan">{t('dashboard.title_highlight')}</span>
          </h1>
          <div className="flex items-center gap-4 text-foreground/30 text-[10px] font-bold uppercase tracking-[0.2em]">
            <span>{rooms.length} {t('dashboard.stats_active')}</span>
            <span className="w-1 h-1 bg-foreground/10 rounded-full" />
            <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 bg-neon-green rounded-full animate-pulse" /> {t('dashboard.stats_optimal')}</span>
          </div>
        </div>
        <Button
          onClick={() => setShowModal(true)}
          size="lg"
          variant="primary"
          className="h-14 px-10"
        >
          {t('dashboard.create_button')}
        </Button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-8 mb-12 border-b border-white/5">
        <button
          onClick={() => setActiveTab('rooms')}
          className={`pb-4 text-xs font-black uppercase tracking-[0.2em] transition-all relative ${activeTab === 'rooms' ? 'text-neon-cyan' : 'text-foreground/30 hover:text-foreground'
            }`}
        >
          {t('dashboard.tabs.rooms')}
          {activeTab === 'rooms' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-neon-cyan shadow-neon-cyan" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('feed')}
          className={`pb-4 text-xs font-black uppercase tracking-[0.2em] transition-all relative ${activeTab === 'feed' ? 'text-neon-cyan' : 'text-foreground/30 hover:text-foreground'
            }`}
        >
          {t('dashboard.tabs.feed')}
          {activeTab === 'feed' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-neon-cyan shadow-neon-cyan" />
          )}
        </button>
      </div>

      {/* Main Content */}
      {activeTab === 'rooms' ? (
        rooms.length === 0 ? (
          <div className="bg-card/50 border border-border p-20 text-center relative overflow-hidden group">
            <div className="w-20 h-20 bg-muted border border-border flex items-center justify-center mx-auto mb-10 skew-x-[-6deg] group-hover:border-neon-cyan transition-all">
              <div className="skew-x-[6deg] text-foreground/20">
                <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
            </div>
            <h2 className="text-2xl font-black uppercase tracking-tighter mb-4 italic text-foreground/80">{t('dashboard.no_rooms_title')}</h2>
            <p className="text-foreground/40 max-w-sm mx-auto mb-10 text-xs font-bold uppercase tracking-widest leading-relaxed">
              {t('dashboard.no_rooms_desc')}
            </p>
            <Button onClick={() => setShowModal(true)} variant="cyber" className="px-10">
              {t('dashboard.create_first')}
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {rooms.map((room) => (
              <RoomCard
                key={room.id}
                room={room}
                showActions
                onDelete={handleDeleteRoom}
              />
            ))}

            <button
              onClick={() => setShowModal(true)}
              className="group flex flex-col items-center justify-center p-8 border border-dashed border-border bg-card/30 hover:bg-card hover:border-neon-cyan/50 transition-all min-h-[260px] skew-x-[-2deg]"
            >
              <div className="skew-x-[2deg] flex flex-col items-center">
                <div className="w-12 h-12 bg-muted border border-border flex items-center justify-center mb-6 skew-x-[-6deg] group-hover:border-neon-cyan transition-all">
                  <div className="skew-x-[6deg] text-foreground/20 group-hover:text-neon-cyan">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-foreground/20 group-hover:text-foreground transition-colors">{t('dashboard.add_card')}</span>
              </div>
            </button>
          </div>
        )
      ) : (
        <div className="space-y-6 animate-fade-in">
          {feedLoading ? (
            <div className="py-32 flex flex-col items-center justify-center gap-6">
              <LoadingSpinner />
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-neon-cyan animate-pulse">Synchronizing Global Intelligence...</p>
            </div>
          ) : globalActivities.length === 0 ? (
            <div className="bg-card/30 border border-dashed border-border p-24 text-center">
              <p className="text-lg font-black text-foreground/20 uppercase italic tracking-tighter">No recent activity detected across your network</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {globalActivities.map((act, idx) => {
                const isBuy = act.type === 'buy';
                const isSell = act.type === 'sell';
                return (
                  <Card key={idx} className="p-6 bg-card/50 border-border hover:border-foreground/10 group transition-all">
                    <div className="flex items-center justify-between gap-6">
                      <div className="flex items-center gap-6 flex-1 min-w-0">
                        <div className={`w-12 h-12 border skew-x-[-12deg] flex items-center justify-center shrink-0 ${isBuy ? 'border-neon-green/30 text-neon-green bg-neon-green/5' : isSell ? 'border-neon-red/30 text-neon-red bg-neon-red/5' : 'border-border text-foreground/20 bg-muted/30'
                          }`}>
                          <div className="skew-x-[12deg]">
                            {isBuy ? (
                              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M7 11l5-5m0 0l5 5m-5-5v12" /></svg>
                            ) : isSell ? (
                              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M17 13l-5 5m0 0l-5-5m5 5V6" /></svg>
                            ) : (
                              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                            )}
                          </div>
                        </div>
                        <div className="min-w-0 space-y-1">
                          <p className="text-sm font-black text-foreground group-hover:text-neon-cyan transition-colors uppercase tracking-tight truncate leading-tight">
                            <MarketTitle text={act.market} />
                          </p>
                          <div className="flex items-center gap-3 text-[9px] font-bold text-foreground/30 uppercase tracking-[0.2em]">
                            <span className="text-foreground/60">{formatDisplayName(act)}</span>
                            <span className="text-foreground/10">•</span>
                            <span className={isBuy ? 'text-neon-green' : isSell ? 'text-neon-red' : ''}>
                              {isBuy ? t('room_detail.type_buy') : isSell ? t('room_detail.type_sell') : act.type}
                            </span>
                            <span className="text-foreground/10">•</span>
                            <span className="text-foreground">${act.amount.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-[10px] font-mono font-bold text-foreground/10 uppercase tracking-widest shrink-0">
                        {formatTimestamp(act.timestamp, t)}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Create Room Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => !creating && setShowModal(false)}
        title={t('dashboard.modal_title')}
        footer={
          <div className="flex gap-3 w-full">
            <Button
              variant="outline"
              onClick={() => setShowModal(false)}
              disabled={creating}
              className="flex-1"
            >
              {t('common.cancel')}
            </Button>
            <Button
              onClick={handleCreateRoom}
              disabled={creating || !roomName.trim()}
              isLoading={creating}
              className="flex-1"
            >
              {t('common.create')}
            </Button>
          </div>
        }
      >
        <div className="space-y-6">
          <p className="text-[11px] text-foreground/40 uppercase tracking-widest font-bold leading-relaxed">
            {t('dashboard.modal_subtitle')}
          </p>
          <Input
            label={t('dashboard.modal_label')}
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
            placeholder={t('dashboard.modal_placeholder')}
            autoFocus
            disabled={creating}
            error={error}
          />
        </div>
      </Modal>
    </div>
  );
}
