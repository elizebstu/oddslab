import { Link } from 'react-router-dom';
import type { Room } from '../services/roomService';
import Card from './ui/Card';
import Button from './ui/Button';

interface RoomCardProps {
  room: Room;
  variant?: 'default' | 'compact';
  showActions?: boolean;
  onDelete?: (id: string) => void;
}

export default function RoomCard({ room, variant = 'default', showActions = false, onDelete }: RoomCardProps) {
  const linkPath = showActions ? `/rooms/${room.id}` : `/public/${room.id}`;

  if (variant === 'compact') {
    return (
      <Link to={linkPath}>
        <Card hover className="flex items-center justify-between p-5 group border-white/5 bg-midnight-950">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 skew-x-[-6deg] bg-midnight-800 border border-white/5 flex items-center justify-center group-hover:border-neon-cyan transition-all">
              <div className="skew-x-[6deg] text-neon-cyan">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
            </div>
            <div>
              <h3 className="font-bold text-white group-hover:text-neon-cyan transition-colors uppercase tracking-tight italic">{room.name}</h3>
              <p className="text-[9px] text-white/30 font-bold uppercase tracking-widest mt-0.5">
                {room.addresses?.length || 0} ADDRESSES
              </p>
            </div>
          </div>
          <svg className="w-4 h-4 text-white/20 group-hover:text-neon-cyan group-hover:translate-x-1 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
          </svg>
        </Card>
      </Link>
    );
  }

  return (
    <Card hover className="p-8 border-white/5 bg-midnight-900/40">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h3 className="text-2xl font-black text-white hover:text-neon-cyan transition-colors mb-2 italic uppercase tracking-tighter leading-none">{room.name}</h3>
          {(room.isPublic || (room as any).public) && (
            <div className="inline-flex items-center gap-2 px-2 py-0.5 bg-neon-green text-midnight-950 text-[9px] font-bold uppercase tracking-widest skew-x-[-6deg]">
              <span className="skew-x-[6deg]">Public</span>
            </div>
          )}
        </div>
        <div className="w-12 h-12 skew-x-[-6deg] bg-midnight-800 border-2 border-white/5 flex items-center justify-center text-neon-cyan">
          <div className="skew-x-[6deg]">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 text-[10px] text-white/30 mb-8 font-bold uppercase tracking-[0.2em]">
        <div className="flex -space-x-1">
          {[1, 2, 3].map((i) => (
            <div key={i} className="w-4 h-4 bg-midnight-800 border border-white/10 skew-x-[-6deg]" />
          ))}
        </div>
        <span>{room.addresses?.length || 0} Addresses Tracked</span>
      </div>

      <div className="flex gap-4">
        <Link to={linkPath} className="flex-1">
          <Button variant="cyber" className="w-full text-[10px] h-10">
            View Room
          </Button>
        </Link>
        {showActions && onDelete && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDelete(room.id)}
            className="group/del !px-3 hover:!border-neon-red/50 hover:!bg-neon-red/5"
          >
            <svg className="w-4 h-4 text-white/20 group-hover/del:text-neon-red transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </Button>
        )}
      </div>
    </Card>
  );
}
