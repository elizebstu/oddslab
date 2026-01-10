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
    <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-black selection:text-white">
      <nav className="w-full border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-6 h-16 flex justify-between items-center">
          <Link to="/" className="text-xl font-bold tracking-tight">Oddslab</Link>
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
                <Link to="/register" className="bg-black text-white px-4 py-2 rounded-full hover:bg-gray-800 transition-colors">
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight mb-2">Explore Public Rooms</h2>
            <p className="text-gray-500">Discover what others are tracking.</p>
          </div>
          <Link to="/" className="text-sm font-medium text-gray-400 hover:text-black transition-colors">
            ← Back to Home
          </Link>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24 text-sm text-gray-500">
            Loading...
          </div>
        ) : rooms.length === 0 ? (
          <div className="text-center py-24 border border-dashed border-gray-200 rounded-2xl">
            <p className="text-gray-500 mb-6">No public rooms yet.</p>
            <Link to="/register" className="text-black font-medium hover:underline">
              Create the first one!
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rooms.map((room) => (
              <Link
                key={room.id}
                to={`/public/${room.id}`}
                className="group block p-6 border border-gray-100 rounded-2xl hover:border-gray-300 transition-colors"
              >
                <h3 className="text-lg font-semibold tracking-tight mb-2 group-hover:underline decoration-1 underline-offset-4">{room.name}</h3>
                <span className="text-xs font-mono text-gray-400 bg-gray-50 px-2 py-1 rounded inline-block mb-4">
                  {room.addresses?.length || 0} ADDR
                </span>
                <div className="text-xs text-gray-400 border-t border-gray-50 pt-4">
                  Updated {new Date(room.updatedAt).toLocaleDateString()}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
