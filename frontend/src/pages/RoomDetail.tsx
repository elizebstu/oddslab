import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { roomService } from '../services/roomService';
import type { Room, Activity } from '../services/roomService';

export default function RoomDetail() {
  const { id } = useParams<{ id: string }>();
  const [room, setRoom] = useState<Room | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [addressInput, setAddressInput] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadRoom();
    loadActivities();
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
      const data = await roomService.getActivities(id!);
      setActivities(data);
    } catch (error) {
      console.error('Failed to load activities:', error);
    }
  };

  const handleAddAddresses = async (e: React.FormEvent) => {
    e.preventDefault();
    const addresses = addressInput.split(/[,\n]/).map(a => a.trim()).filter(a => a);
    try {
      await roomService.addAddresses(id!, addresses);
      setAddressInput('');
      loadRoom();
      loadActivities();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to add addresses');
    }
  };

  const handleRemoveAddress = async (addressId: string) => {
    try {
      await roomService.removeAddress(id!, addressId);
      loadRoom();
      loadActivities();
    } catch (error) {
      console.error('Failed to remove address:', error);
    }
  };

  const handleToggleVisibility = async () => {
    try {
      await roomService.toggleVisibility(id!);
      loadRoom();
    } catch (error) {
      console.error('Failed to toggle visibility:', error);
    }
  };

  const copyPublicLink = () => {
    const link = `${window.location.origin}/public/${id}`;
    navigator.clipboard.writeText(link);
    alert('Public link copied to clipboard!');
  };

  if (loading) return <div className="flex items-center justify-center min-h-screen bg-white text-sm text-gray-500">Loading...</div>;
  if (!room) return <div className="flex items-center justify-center min-h-screen bg-white text-sm text-gray-500">Room not found</div>;

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-black selection:text-white">
      <nav className="w-full border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-6 h-16 flex justify-between items-center">
          <button
            onClick={() => navigate('/dashboard')}
            className="text-sm font-medium text-gray-500 hover:text-black transition-colors"
          >
            ← Dashboard
          </button>
          <h1 className="text-lg font-bold tracking-tight">{room.name}</h1>
          <div className="flex gap-3">
            <button
              onClick={handleToggleVisibility}
              className="text-xs px-3 py-1.5 border border-gray-200 rounded-full hover:bg-gray-50 transition-colors"
            >
              {room.isPublic ? 'Make Private' : 'Make Public'}
            </button>
            {room.isPublic && (
              <button
                onClick={copyPublicLink}
                className="text-xs px-3 py-1.5 bg-black text-white rounded-full hover:bg-gray-800 transition-colors"
              >
                Copy Link
              </button>
            )}
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-1 space-y-8">
          <div>
            <h2 className="text-lg font-bold tracking-tight mb-4">Addresses</h2>
            <form onSubmit={handleAddAddresses} className="mb-6">
              <textarea
                value={addressInput}
                onChange={(e) => setAddressInput(e.target.value)}
                placeholder="0x123..."
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all font-mono text-sm mb-3"
                rows={3}
              />
              <button
                type="submit"
                className="w-full bg-black text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors"
              >
                Add Addresses
              </button>
            </form>
            <div className="space-y-2">
              {room.addresses?.map((addr) => (
                <div key={addr.id} className="flex justify-between items-center p-3 border border-gray-100 rounded-lg group hover:border-gray-300 transition-colors">
                  <span className="text-xs font-mono text-gray-600 truncate">{addr.address}</span>
                  <button
                    onClick={() => handleRemoveAddress(addr.id)}
                    className="text-gray-400 hover:text-red-600 text-xs transition-colors opacity-0 group-hover:opacity-100"
                  >
                    Remove
                  </button>
                </div>
              ))}
              {(!room.addresses || room.addresses.length === 0) && (
                <p className="text-sm text-gray-400 italic">No addresses added yet.</p>
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div>
            <h2 className="text-lg font-bold tracking-tight mb-6">Activity Feed</h2>
            {activities.length === 0 ? (
              <div className="py-12 border border-dashed border-gray-200 rounded-xl text-center">
                <p className="text-gray-500 text-sm">No activities found.</p>
              </div>
            ) : (
              <div className="space-y-6 relative border-l border-gray-100 ml-3 pl-8">
                {activities.map((activity, idx) => (
                  <div key={idx} className="relative">
                    <div className="absolute -left-[37px] top-1 h-2.5 w-2.5 rounded-full bg-gray-200 border-2 border-white"></div>
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{activity.market}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          <span className="font-mono text-gray-400">{activity.address.slice(0, 8)}</span>
                          <span className="mx-2 text-gray-300">•</span>
                          <span className={`font-semibold uppercase ${
                            activity.type === 'buy' ? 'text-green-600' :
                            activity.type === 'sell' ? 'text-red-600' :
                            'text-blue-600'
                          }`}>{activity.type}</span>
                          <span className="mx-2 text-gray-300">•</span>
                          <span>${activity.amount.toLocaleString()}</span>
                          {activity.outcome && (
                            <>
                              <span className="mx-2 text-gray-300">•</span>
                              <span className="text-gray-600">{activity.outcome}</span>
                            </>
                          )}
                        </p>
                      </div>
                      <span className="text-xs text-gray-400 tabular-nums">
                        {new Date(activity.timestamp).toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
