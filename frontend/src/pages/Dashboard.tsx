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
      Loading...
    </div>
  );

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-black selection:text-white">
      <nav className="w-full border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-6 h-16 flex justify-between items-center">
          <Link to="/" className="text-xl font-bold tracking-tight">Oddslab</Link>
          <button
            onClick={logout}
            className="text-sm font-medium text-gray-500 hover:text-black transition-colors"
          >
            Log out
          </button>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-3xl font-bold tracking-tight mb-2">My Rooms</h2>
            <p className="text-gray-500">Manage your tracking spaces.</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="bg-black text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-gray-800 transition-colors"
          >
            Create Room
          </button>
        </div>

        {rooms.length === 0 ? (
          <div className="text-center py-24 border border-dashed border-gray-200 rounded-2xl">
            <p className="text-gray-500 mb-6">No rooms yet.</p>
            <button
              onClick={() => setShowModal(true)}
              className="text-black font-medium hover:underline"
            >
              Create your first room logic
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rooms.map((room) => (
              <div key={room.id} className="group p-6 border border-gray-100 rounded-2xl hover:border-gray-300 transition-colors">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold tracking-tight">{room.name}</h3>
                  <span className="text-xs font-mono text-gray-400 bg-gray-50 px-2 py-1 rounded">
                    {room.addresses?.length || 0} ADDR
                  </span>
                </div>

                <div className="flex gap-3 mt-8">
                  <Link
                    to={`/rooms/${room.id}`}
                    className="flex-1 bg-gray-50 text-black px-4 py-2 rounded-lg text-sm font-medium text-center hover:bg-gray-100 transition-colors"
                  >
                    View
                  </Link>
                  <button
                    onClick={() => handleDeleteRoom(room.id)}
                    className="px-4 py-2 text-gray-400 hover:text-red-600 text-sm font-medium transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-2xl max-w-md w-full mx-4">
            <h3 className="text-xl font-bold mb-6 tracking-tight">Create New Room</h3>
            <form onSubmit={handleCreateRoom}>
              <div className="mb-6">
                <input
                  type="text"
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                  placeholder="Room Name"
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
