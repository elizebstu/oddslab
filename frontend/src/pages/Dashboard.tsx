import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { roomService } from '../services/roomService';
import type { Room } from '../services/roomService';
import { useAuth } from '../hooks/useAuth';

export default function Dashboard() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [roomName, setRoomName] = useState('');
  const { logout } = useAuth();

  useEffect(() => {
    loadRooms();
  }, []);

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
    try {
      await roomService.createRoom(roomName);
      setRoomName('');
      setShowModal(false);
      loadRooms();
    } catch (error) {
      console.error('Failed to create room:', error);
    }
  };

  const handleDeleteRoom = async (id: string) => {
    if (!confirm('Are you sure you want to delete this room?')) return;
    try {
      await roomService.deleteRoom(id);
      loadRooms();
    } catch (error) {
      console.error('Failed to delete room:', error);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-white text-sm text-gray-500">
      <div className="flex items-center gap-3">
        <svg className="animate-spin h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Loading...
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans selection:bg-black selection:text-white">
      <nav className="w-full border-b border-gray-200/60 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex justify-between items-center">
          <Link to="/" className="text-xl font-bold tracking-tight text-gray-900">Oddslab</Link>
          <div className="flex items-center gap-6">
            <Link to="/explore" className="text-sm font-medium text-gray-500 hover:text-black transition-colors">
              Explore
            </Link>
            <button
              onClick={logout}
              className="text-sm font-medium text-gray-500 hover:text-black transition-colors"
            >
              Log out
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-12">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-2">My Rooms</h1>
            <p className="text-gray-500">Manage your tracking spaces</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="bg-black text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-gray-800 transition-all hover:shadow-lg hover:shadow-black/20 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create Room
          </button>
        </div>

        {rooms.length === 0 ? (
          <div className="text-center py-24 bg-white border-2 border-dashed border-gray-200 rounded-3xl">
            <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">No rooms yet</h3>
            <p className="text-gray-500 mb-6">Create your first room to start tracking wallets</p>
            <button
              onClick={() => setShowModal(true)}
              className="bg-black text-white px-6 py-3 rounded-full text-sm font-medium hover:bg-gray-800 transition-all hover:shadow-lg"
            >
              Create Your First Room
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rooms.map((room) => (
              <div key={room.id} className="group bg-white border border-gray-200 rounded-3xl p-6 hover:border-gray-300 hover:shadow-xl hover:shadow-gray-100/50 transition-all duration-300">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold tracking-tight">{room.name}</h3>
                  {room.isPublic && (
                    <span className="flex items-center gap-1 text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Public
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3 text-sm text-gray-500 mb-6">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>{room.addresses?.length || 0} {room.addresses?.length === 1 ? 'address' : 'addresses'}</span>
                </div>

                <div className="flex gap-3">
                  <Link
                    to={`/rooms/${room.id}`}
                    className="flex-1 bg-gray-100 text-black px-4 py-2.5 rounded-xl text-sm font-medium text-center hover:bg-gray-200 transition-colors"
                  >
                    View Room
                  </Link>
                  <button
                    onClick={() => handleDeleteRoom(room.id)}
                    className="px-3 py-2.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowModal(false)}>
          <div className="bg-white p-8 rounded-3xl shadow-2xl max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-bold mb-2 tracking-tight">Create New Room</h3>
            <p className="text-sm text-gray-500 mb-6">Give your room a name to get started</p>
            <form onSubmit={handleCreateRoom}>
              <div className="mb-6">
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">Room Name</label>
                <input
                  type="text"
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                  placeholder="e.g., Top Traders"
                  required
                  autoFocus
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all"
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-black text-white px-4 py-3 rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors"
                >
                  Create Room
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
