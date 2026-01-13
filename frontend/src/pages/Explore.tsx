import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import LoadingSpinner from '../components/LoadingSpinner';
import Button from '../components/ui/Button';
import RoomCard from '../components/RoomCard';
import { roomService } from '../services/roomService';
import type { Room } from '../services/roomService';

type SortOption = 'recent' | 'addresses' | 'name';

export default function Explore() {
  const { t } = useTranslation();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('recent');

  useEffect(() => {
    loadPublicRooms();
  }, []);

  const loadPublicRooms = async () => {
    try {
      const data = await roomService.getPublicRooms();
      setRooms(data);
    } catch (error) {
      console.error('Failed to load public rooms:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredAndSortedRooms = useMemo(() => {
    let result = [...rooms];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(room =>
        room.name.toLowerCase().includes(query)
      );
    }

    switch (sortBy) {
      case 'recent':
        result.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
        break;
      case 'addresses':
        result.sort((a, b) => (b.addresses?.length || 0) - (a.addresses?.length || 0));
        break;
      case 'name':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
    }

    return result;
  }, [rooms, searchQuery, sortBy]);

  if (loading) {
    return <LoadingSpinner fullScreen text={t('common.loading')} />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 animate-fade-in">
      {/* Header */}
      <div className="mb-16 text-center max-w-2xl mx-auto space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-neon-cyan/10 border border-neon-cyan/20 skew-x-[-6deg]">
          <span className="w-1.5 h-1.5 bg-neon-cyan animate-pulse shadow-neon-cyan" />
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-neon-cyan skew-x-[6deg]">{t('explore.badge')}</span>
        </div>
        <h1 className="text-5xl md:text-6xl font-display font-black uppercase tracking-tighter italic text-foreground flex justify-center gap-3">
          {t('explore.title')} <span className="text-neon-cyan glow-text-cyan">{t('explore.title_highlight')}</span>
        </h1>
        <p className="text-base text-foreground/40 font-bold uppercase tracking-tight leading-relaxed">
          {t('explore.subtitle')}
        </p>
      </div>

      {/* Control Bar */}
      <div className="flex flex-col lg:flex-row items-center gap-6 mb-16 bg-card border border-border p-6 skew-x-[-2deg]">
        <div className="relative flex-1 w-full skew-x-[2deg]">
          <svg className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('explore.search_placeholder')}
            className="w-full h-12 pl-14 pr-6 bg-muted border border-border focus:border-neon-cyan transition-all outline-none text-foreground font-mono text-sm placeholder:text-foreground/20"
          />
        </div>

        <div className="flex items-center gap-6 w-full lg:w-auto skew-x-[2deg]">
          <div className="relative shrink-0">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="appearance-none h-12 pl-6 pr-12 bg-muted border border-border hover:border-foreground/20 transition-all outline-none text-[10px] font-bold uppercase tracking-widest text-foreground/50 cursor-pointer min-w-[180px]"
            >
              <option value="recent">{t('explore.sort_recent')}</option>
              <option value="addresses">{t('explore.sort_addresses')}</option>
              <option value="name">{t('explore.sort_name')}</option>
            </select>
            <svg className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/20 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
            </svg>
          </div>

          <div className="h-12 px-6 flex items-center bg-neon-cyan text-midnight-950 font-black text-[10px] uppercase tracking-[0.2em] skew-x-[-6deg] shrink-0 whitespace-nowrap">
            <span className="skew-x-[6deg] uppercase">{filteredAndSortedRooms.length} {t('explore.stats_active')}</span>
          </div>
        </div>
      </div>

      {rooms.length === 0 ? (
        <div className="py-24 text-center border border-dashed border-border bg-card/10">
          <p className="text-xl font-black text-foreground/20 uppercase italic tracking-tighter">{t('explore.no_rooms')}</p>
        </div>
      ) : filteredAndSortedRooms.length === 0 ? (
        <div className="py-24 text-center">
          <p className="text-lg font-black text-foreground/20 uppercase tracking-widest mb-8">{t('explore.no_matches', { query: searchQuery })}</p>
          <Button variant="ghost" onClick={() => setSearchQuery('')}>{t('explore.clear_search')}</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredAndSortedRooms.map((room) => (
            <RoomCard
              key={room.id}
              room={room}
            />
          ))}
        </div>
      )}
    </div>
  );
}
