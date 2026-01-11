import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { roomService } from '../services/roomService';
import type { Room, Activity } from '../services/roomService';

export default function RoomDetail() {
  const { id } = useParams<{ id: string }>();
  const [room, setRoom] = useState<Room | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [addressInput, setAddressInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [addError, setAddError] = useState('');
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
    setAddError('');
    const addresses = addressInput.split(/[,\n]/).map(a => a.trim()).filter(a => a);
    try {
      await roomService.addAddresses(id!, addresses);
      setAddressInput('');
      loadRoom();
      loadActivities();
    } catch (error: any) {
      const responseData = error.response?.data;
      if (responseData?.notFound && Array.isArray(responseData.notFound)) {
        setAddError(`Could not find: ${responseData.notFound.join(', ')}`);
      } else {
        setAddError(responseData?.error || 'Failed to add addresses');
      }
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
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatDisplayName = (activity: Activity) => {
    if (activity.userName) {
      return activity.userName;
    }
    return formatAddress(activity.address);
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 text-sm text-gray-500">
      <div className="flex items-center gap-3">
        <svg className="animate-spin h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Loading...
      </div>
    </div>
  );
  if (!room) return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 text-sm text-gray-500">
      Room not found
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans selection:bg-black selection:text-white">
      <nav className="w-full border-b border-gray-200/60 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex justify-between items-center">
          <button
            onClick={() => navigate('/dashboard')}
            className="text-sm font-medium text-gray-500 hover:text-black transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Dashboard
          </button>
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-bold tracking-tight">{room.name}</h1>
            {room.isPublic && (
              <span className="flex items-center gap-1 text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Public
              </span>
            )}
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleToggleVisibility}
              className="text-xs px-4 py-2 border border-gray-200 rounded-full hover:bg-gray-50 transition-colors font-medium"
            >
              {room.isPublic ? 'Make Private' : 'Make Public'}
            </button>
            {room.isPublic && (
              <button
                onClick={copyPublicLink}
                className="text-xs px-4 py-2 bg-black text-white rounded-full hover:bg-gray-800 transition-colors font-medium flex items-center gap-2"
              >
                {copied ? (
                  <>
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Copied
                  </>
                ) : (
                  <>
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Copy Link
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-3xl border border-gray-200 p-6">
            <h2 className="text-lg font-bold tracking-tight mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Addresses
            </h2>
            <form onSubmit={handleAddAddresses} className="mb-6">
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
                Add Address or Username
              </label>
              <textarea
                value={addressInput}
                onChange={(e) => setAddressInput(e.target.value)}
                placeholder="kch123&#10;0x1234...&#10;@username"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all font-mono text-sm mb-3 resize-none"
                rows={3}
              />
              {addError && (
                <div className="bg-red-50 text-red-600 text-sm p-3 rounded-xl mb-3 flex items-center gap-2">
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {addError}
                </div>
              )}
              <button
                type="submit"
                className="w-full bg-black text-white px-4 py-3 rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Addresses
              </button>
            </form>
            <div className="space-y-2">
              {room.addresses?.map((addr) => (
                <div key={addr.id} className="group flex justify-between items-center p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                      <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <span className="text-sm font-mono text-gray-700">{formatAddress(addr.address)}</span>
                  </div>
                  <button
                    onClick={() => handleRemoveAddress(addr.id)}
                    className="text-gray-400 hover:text-red-600 text-sm transition-colors opacity-0 group-hover:opacity-100 p-1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
              {(!room.addresses || room.addresses.length === 0) && (
                <div className="text-center py-8 text-gray-400 text-sm">
                  No addresses added yet
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-8">
          <div className="bg-white rounded-3xl border border-gray-200 p-6">
            <h2 className="text-lg font-bold tracking-tight mb-6 flex items-center gap-2">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              Activity Feed
              <span className="text-sm font-normal text-gray-400">
                ({activities.length} {activities.length === 1 ? 'activity' : 'activities'})
              </span>
            </h2>
            {activities.length === 0 ? (
              <div className="py-16 text-center">
                <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <p className="text-gray-500">No activities found</p>
                <p className="text-sm text-gray-400 mt-1">Add addresses to see their trading activity</p>
              </div>
            ) : (
              <div className="space-y-4">
                {activities.map((activity, idx) => (
                  <div
                    key={idx}
                    className="group p-4 rounded-2xl border border-gray-100 hover:border-gray-200 hover:bg-gray-50/50 transition-all"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                          activity.type === 'buy'
                            ? 'bg-green-100'
                            : activity.type === 'sell'
                            ? 'bg-red-100'
                            : 'bg-gray-100'
                        }`}>
                          {activity.type === 'buy' ? (
                            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                            </svg>
                          ) : activity.type === 'sell' ? (
                            <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" />
                            </svg>
                          ) : (
                            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">{activity.market}</p>
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5 text-sm">
                            <span className={`text-gray-500 ${activity.userName ? 'font-medium' : 'font-mono text-xs'}`}>{formatDisplayName(activity)}</span>
                            <span className="text-gray-300">•</span>
                            <span className={`font-semibold uppercase ${
                              activity.type === 'buy' ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {activity.type}
                            </span>
                            <span className="text-gray-300">•</span>
                            <span className="font-semibold text-gray-900">
                              ${activity.amount.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      <span className="text-xs text-gray-400 whitespace-nowrap tabular-nums">
                        {formatTimestamp(activity.timestamp)}
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
