import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import RoomCard from '../components/RoomCard';
import OnboardingTour from '../components/OnboardingTour';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import TextArea from '../components/ui/TextArea';
import Modal from '../components/ui/Modal';
import { roomService } from '../services/roomService';
import type { Room } from '../services/roomService';

export default function Dashboard() {
  const { t } = useTranslation();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(false); // Changed to false - show UI immediately
  const [initialLoad, setInitialLoad] = useState(true); // Track first load
  const [showModal, setShowModal] = useState(false);
  const [roomName, setRoomName] = useState('');
  const [description, setDescription] = useState('');
  const [twitterLink, setTwitterLink] = useState('');
  const [telegramLink, setTelegramLink] = useState('');
  const [discordLink, setDiscordLink] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirmRoom, setDeleteConfirmRoom] = useState<{ id: string; name: string } | null>(null);

  useEffect(() => {
    loadRooms();
  }, []);

  const loadRooms = useCallback(async () => {
    setLoading(true);
    try {
      const data = await roomService.getRooms();
      setRooms(data);
    } catch (error) {
      console.error('Failed to load rooms:', error);
    } finally {
      setLoading(false);
      setInitialLoad(false);
    }
  }, []);

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setCreating(true);
    try {
      await roomService.createRoom(roomName, description, twitterLink, telegramLink, discordLink);
      setRoomName('');
      setDescription('');
      setTwitterLink('');
      setTelegramLink('');
      setDiscordLink('');
      setShowModal(false);
      loadRooms();
    } catch (error: any) {
      console.error('Failed to create room:', error);
      const errorMsg = error.response?.data?.error || error.message || t('dashboard.modal_error');
      setError(errorMsg);
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteRoom = useCallback((id: string, name: string) => {
    setDeleteConfirmRoom({ id, name });
  }, []);

  const confirmDeleteRoom = useCallback(async () => {
    if (!deleteConfirmRoom) return;
    setIsDeleting(true);
    try {
      await roomService.deleteRoom(deleteConfirmRoom.id);
      setDeleteConfirmRoom(null);
      loadRooms();
    } catch (error) {
      console.error('Failed to delete room:', error);
    } finally {
      setIsDeleting(false);
    }
  }, [deleteConfirmRoom, loadRooms]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 relative animate-fade-in">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 mb-16 border-l-4 border-neon-cyan pl-6 py-2">
        <div className="space-y-1">
          <h1 className="text-4xl md:text-5xl font-display font-black uppercase tracking-tighter italic text-foreground">
            {t('dashboard.title')}<span className="text-neon-cyan glow-text-cyan">{t('dashboard.title_highlight')}</span>
          </h1>
          <div className="flex items-center gap-4 text-foreground/30 text-[10px] font-bold uppercase tracking-[0.2em]">
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-neon-cyan rounded-full animate-pulse" />
                {t('common.loading')}
              </span>
            ) : (
              <span>{rooms.length} {t('dashboard.stats_active')}</span>
            )}
            <span className="w-1 h-1 bg-foreground/10 rounded-full" />
            <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 bg-neon-green rounded-full animate-pulse" /> {t('dashboard.stats_optimal')}</span>
          </div>
        </div>
        <Button
          onClick={() => setShowModal(true)}
          size="lg"
          variant="primary"
          className="h-14 px-10 dashboard-create-btn"
        >
          {t('dashboard.create_button')}
        </Button>
      </div>

      {/* Main Content */}
      {rooms.length === 0 && initialLoad ? (
        // Skeleton loading state
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-card/50 border border-border p-8 min-h-[260px] animate-pulse">
              <div className="w-16 h-16 bg-muted border border-border mb-6" />
              <div className="h-6 bg-muted/50 w-3/4 mb-4" />
              <div className="h-4 bg-muted/30 w-1/2" />
            </div>
          ))}
        </div>
      ) : rooms.length === 0 ? (
        // Empty state
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
            <div key={room.id} className="room-card">
              <RoomCard
                room={room}
                showActions
                onDelete={(id) => handleDeleteRoom(id, room.name)}
                isDeleting={isDeleting}
              />
            </div>
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
          <Input
            label={t('dashboard.modal_label')}
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
            placeholder={t('dashboard.modal_placeholder')}
            autoFocus
            disabled={creating}
            error={error}
          />
          <TextArea
            label={t('dashboard.description_label')}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={t('dashboard.description_placeholder')}
            disabled={creating}
            rows={4}
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label={t('dashboard.twitter_label')}
              value={twitterLink}
              onChange={(e) => setTwitterLink(e.target.value)}
              placeholder="https://x.com/..."
              disabled={creating}
            />
            <Input
              label={t('dashboard.telegram_label')}
              value={telegramLink}
              onChange={(e) => setTelegramLink(e.target.value)}
              placeholder="https://t.me/..."
              disabled={creating}
            />
            <Input
              label={t('dashboard.discord_label')}
              value={discordLink}
              onChange={(e) => setDiscordLink(e.target.value)}
              placeholder="https://discord.gg/..."
              disabled={creating}
            />
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteConfirmRoom !== null}
        onClose={() => !isDeleting && setDeleteConfirmRoom(null)}
        title={t('dashboard.delete_confirm_title', { defaultValue: 'Delete Room' })}
        footer={
          <div className="flex gap-3 w-full">
            <Button
              variant="outline"
              onClick={() => setDeleteConfirmRoom(null)}
              disabled={isDeleting}
              className="flex-1"
            >
              {t('common.cancel')}
            </Button>
            <Button
              onClick={confirmDeleteRoom}
              disabled={isDeleting}
              isLoading={isDeleting}
              variant="danger"
              className="flex-1"
            >
              {t('common.delete')}
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <p className="text-sm text-foreground/70">
            {t('dashboard.delete_confirm_message', {
              defaultValue: 'Are you sure you want to delete "{{roomName}}"? This action cannot be undone.',
              roomName: deleteConfirmRoom?.name
            })}
          </p>
        </div>
      </Modal>

      {/* Onboarding Tour */}
      <OnboardingTour pageName="dashboard" />
    </div>
  );
}
