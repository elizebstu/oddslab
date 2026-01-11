import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { roomService } from '../services/roomService';
import type { Room } from '../services/roomService';
import { useAuth } from '../hooks/useAuth';

export default function Explore() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

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

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans selection:bg-black selection:text-white">
      <nav className="w-full border-b border-gray-200/60 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex justify-between items-center">
          <Link to="/" className="text-xl font-bold tracking-tight text-gray-900">Oddslab</Link>
          <div className="flex gap-4">
            {user ? (
              <Link to="/dashboard" className="text-sm font-medium text-gray-500 hover:text-black transition-colors">
                Dashboard
              </Link>
            ) : (
              <div className="flex items-center gap-4 text-sm font-medium">
                <Link to="/login" className="text-gray-500 hover:text-black transition-colors">
                  Log in
                </Link>
                <Link to="/register" className="bg-black text-white px-5 py-2.5 rounded-full hover:bg-gray-800 transition-all hover:shadow-lg hover:shadow-black/20">
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-12">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="flex items-center gap-1 text-sm font-medium text-green-600 bg-green-50 px-3 py-1.5 rounded-full">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Public Rooms
              </span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight mb-2">Explore</h1>
            <p className="text-gray-500">Discover what others are tracking</p>
          </div>
          <Link to="/" className="text-sm font-medium text-gray-400 hover:text-black transition-colors flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Home
          </Link>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24 text-sm text-gray-500">
            <div className="flex items-center gap-3">
              <svg className="animate-spin h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Loading...
            </div>
          </div>
        ) : rooms.length === 0 ? (
          <div className="text-center py-24 bg-white border-2 border-dashed border-gray-200 rounded-3xl">
            <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">No public rooms yet</h3>
            <p className="text-gray-500 mb-6">Be the first to create and share a room</p>
            <Link to="/register" className="inline-flex items-center gap-2 bg-black text-white px-6 py-3 rounded-full text-sm font-medium hover:bg-gray-800 transition-all hover:shadow-lg">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create the First Room
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rooms.map((room) => (
              <Link
                key={room.id}
                to={`/public/${room.id}`}
                className="group bg-white border border-gray-200 rounded-3xl p-6 hover:border-gray-300 hover:shadow-xl hover:shadow-gray-100/50 transition-all duration-300 hover:-translate-y-1"
              >
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-lg font-semibold tracking-tight group-hover:text-black transition-colors">
                    {room.name}
                  </h3>
                  <span className="flex items-center gap-1 text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Public
                  </span>
                </div>

                <div className="flex items-center gap-3 text-sm text-gray-500 mb-6">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>{room.addresses?.length || 0} {(room.addresses?.length || 0) === 1 ? 'address' : 'addresses'}</span>
                </div>

                <div className="flex items-center justify-between text-xs text-gray-400 border-t border-gray-100 pt-4">
                  <span>Updated {new Date(room.updatedAt).toLocaleDateString()}</span>
                  <svg className="w-4 h-4 text-gray-300 group-hover:text-black transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
