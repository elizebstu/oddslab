import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { roomService } from '../services/roomService';
import type { Room, Activity } from '../services/roomService';

export default function PublicRoom() {
  const { id } = useParams<{ id: string }>();
  const [room, setRoom] = useState<Room | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) return <div className="flex items-center justify-center min-h-screen bg-white text-sm text-gray-500">Loading...</div>;
  if (!room) return <div className="flex items-center justify-center min-h-screen bg-white text-sm text-gray-500">Room not found</div>;

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-black selection:text-white">
      <nav className="w-full border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-6 h-16 flex justify-between items-center">
          <Link to="/" className="text-xl font-bold tracking-tight">Oddslab</Link>
          <Link to="/register" className="bg-black text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-gray-800 transition-colors">
            Create Your Own Room
          </Link>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-12">
        <h2 className="text-3xl font-bold tracking-tight mb-12">{room.name}</h2>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-1">
            <h3 className="text-lg font-bold tracking-tight mb-4">Tracked Addresses</h3>
            <div className="space-y-2">
              {room.addresses?.map((addr) => (
                <div key={addr.id} className="p-3 border border-gray-100 rounded-lg">
                  <span className="text-xs font-mono text-gray-600 truncate block">{addr.address}</span>
                </div>
              ))}
              {(!room.addresses || room.addresses.length === 0) && (
                <p className="text-sm text-gray-400 italic">No addresses added yet.</p>
              )}
            </div>
          </div>

          <div className="lg:col-span-2">
            <h3 className="text-lg font-bold tracking-tight mb-6">Activity Feed</h3>
            {activities.length === 0 ? (
              <div className="py-12 border border-dashed border-gray-200 rounded-xl text-center">
                <p className="text-gray-500 text-sm">No activities yet.</p>
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
                          <span className={`font-semibold uppercase ${activity.type === 'buy' ? 'text-green-600' : 'text-red-600'}`}>{activity.type}</span>
                          <span className="mx-2 text-gray-300">•</span>
                          <span>${activity.amount.toLocaleString()}</span>
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
