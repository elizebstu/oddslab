import { Link } from 'react-router-dom';
import type { Room } from '../services/roomService';

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
      <Link
        to={linkPath}
        className="group flex items-center justify-between p-4 bg-white border border-surface-200 rounded-2xl hover:border-primary-200 hover:shadow-card-hover transition-all duration-300"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center group-hover:bg-gradient-to-br group-hover:from-primary-500 group-hover:to-primary-600 transition-all">
            <svg className="w-5 h-5 text-primary-500 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-surface-900 group-hover:text-primary-700">{room.name}</h3>
            <p className="text-xs text-surface-500">{room.addresses?.length || 0} addresses</p>
          </div>
        </div>
        <svg className="w-5 h-5 text-surface-300 group-hover:text-primary-500 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </Link>
    );
  }

  return (
    <div className="group bg-white border border-surface-200 rounded-3xl p-6 hover:border-primary-200 hover:shadow-card-hover transition-all duration-300">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-semibold tracking-tight text-surface-900">{room.name}</h3>
        {room.isPublic && (
          <span className="flex items-center gap-1.5 text-xs font-medium text-accent-700 bg-accent-50 px-2.5 py-1 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-accent-500"></span>
            Public
          </span>
        )}
      </div>

      <div className="flex items-center gap-3 text-sm text-surface-500 mb-6">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <span>{room.addresses?.length || 0} {room.addresses?.length === 1 ? 'address' : 'addresses'}</span>
      </div>

      <div className="flex gap-3">
        <Link
          to={linkPath}
          className="flex-1 bg-primary-50 text-primary-700 px-4 py-2.5 rounded-xl text-sm font-medium text-center hover:bg-primary-100 transition-colors"
        >
          View Room
        </Link>
        {showActions && onDelete && (
          <button
            onClick={() => onDelete(room.id)}
            className="px-3 py-2.5 text-surface-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
