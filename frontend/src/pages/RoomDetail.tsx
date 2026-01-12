import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import LoadingSpinner from '../components/LoadingSpinner';
import { roomService } from '../services/roomService';
import { addressService } from '../services/addressService';
import { activityService } from '../services/activityService';
import type { Room, Activity, Position } from '../services/roomService';
import { formatAddress, formatDisplayName, formatTimestamp, getRankBadge } from '../utils/formatting';

type TabType = 'positions' | 'activities';

export default function RoomDetail() {
  const { id } = useParams<{ id: string }>();
  const [room, setRoom] = useState<Room | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [addressInput, setAddressInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [addError, setAddError] = useState('');
  const [activeTab, setActiveTab] = useState<TabType>('positions');
  const navigate = useNavigate();

  useEffect(() => {
    loadRoom();
    loadPositions();
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
      const data = await activityService.getActivities(id!);
      setActivities(data);
    } catch (error) {
      console.error('Failed to load activities:', error);
    }
  };

  const loadPositions = async () => {
    try {
      const data = await activityService.getPositions(id!);
      setPositions(data);
    } catch (error) {
      console.error('Failed to load positions:', error);
    }
  };

  const handleAddAddresses = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddError('');
    const addresses = addressInput.split(/[,\n]/).map(a => a.trim()).filter(a => a);
    try {
      await addressService.addAddresses(id!, addresses);
      setAddressInput('');
      loadRoom();
      loadActivities();
      loadPositions();
    } catch (error: any) {
      const responseData = error.response?.data;
      if (responseData?.botAddresses && Array.isArray(responseData.botAddresses)) {
        setAddError(`Bot addresses detected (300+ trades/hour): ${responseData.botAddresses.join(', ')}`);
      } else if (responseData?.notFound && Array.isArray(responseData.notFound)) {
        setAddError(`Could not find Polymarket users: ${responseData.notFound.join(', ')}`);
      } else {
        setAddError(responseData?.error || 'Failed to add addresses');
      }
    }
  };

  const handleRemoveAddress = async (addressId: string) => {
    try {
      await addressService.removeAddress(id!, addressId);
      loadRoom();
      loadActivities();
      loadPositions();
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

  if (loading) {
    return <LoadingSpinner fullScreen text="Loading room..." />;
  }

  if (!room) {
    return (
      <div className="min-h-screen bg-surface-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-surface-900 mb-2">Room not found</h1>
          <p className="text-surface-500 mb-6">This room may have been deleted or you don't have access.</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-primary-600 to-primary-500 text-white px-6 py-3 rounded-xl text-sm font-medium hover:from-primary-700 hover:to-primary-600 transition-all"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-50 text-surface-900 font-sans selection:bg-primary-500 selection:text-white">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/dashboard')}
            className="text-sm font-medium text-surface-500 hover:text-surface-900 transition-colors flex items-center gap-2 mb-4"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </button>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">{room.name}</h1>
              {room.isPublic && (
                <span className="flex items-center gap-1.5 text-xs font-medium text-accent-700 bg-accent-50 px-2.5 py-1 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent-500"></span>
                  Public
                </span>
              )}
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleToggleVisibility}
                className="text-sm px-4 py-2.5 border border-surface-200 rounded-xl hover:bg-surface-100 transition-colors font-medium"
              >
                {room.isPublic ? 'Make Private' : 'Make Public'}
              </button>
              {room.isPublic && (
                <button
                  onClick={copyPublicLink}
                  className="text-sm px-4 py-2.5 bg-gradient-to-r from-primary-600 to-primary-500 text-white rounded-xl hover:from-primary-700 hover:to-primary-600 transition-all font-medium flex items-center gap-2"
                >
                  {copied ? (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Copied!
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      Copy Link
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column - Addresses */}
          <div className="lg:col-span-4">
            <div className="bg-white rounded-3xl border border-surface-200 p-6 shadow-card">
              <h2 className="text-lg font-bold tracking-tight mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-surface-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Addresses
              </h2>
              <form onSubmit={handleAddAddresses} className="mb-6">
                <label className="block text-xs font-semibold uppercase tracking-wider text-surface-500 mb-2">
                  Add Address or Username
                </label>
                <textarea
                  value={addressInput}
                  onChange={(e) => setAddressInput(e.target.value)}
                  placeholder="kch123&#10;0x1234...&#10;@username"
                  className="w-full px-4 py-3 bg-surface-50 border border-surface-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-300 transition-all font-mono text-sm mb-3 resize-none"
                  rows={3}
                />
                {addError && (
                  <div className="bg-red-50 text-red-600 text-sm p-3 rounded-xl mb-3 flex items-start gap-2">
                    <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{addError}</span>
                  </div>
                )}
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-primary-600 to-primary-500 text-white px-4 py-3 rounded-xl text-sm font-medium hover:from-primary-700 hover:to-primary-600 transition-all flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Addresses
                </button>
              </form>
              <div className="space-y-2">
                {room.addresses?.map((addr) => (
                  <div key={addr.id} className="group flex justify-between items-center p-3 bg-surface-50 rounded-xl hover:bg-surface-100 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
                        <svg className="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <span className="text-sm font-mono text-surface-700">{formatAddress(addr.address)}</span>
                    </div>
                    <button
                      onClick={() => handleRemoveAddress(addr.id)}
                      className="text-surface-400 hover:text-red-600 text-sm transition-colors opacity-0 group-hover:opacity-100 p-1"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
                {(!room.addresses || room.addresses.length === 0) && (
                  <div className="text-center py-8 text-surface-400 text-sm">
                    No addresses added yet
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Data */}
          <div className="lg:col-span-8">
            <div className="bg-white rounded-3xl border border-surface-200 shadow-card overflow-hidden">
              {/* Tabs */}
              <div className="flex border-b border-surface-200">
                <button
                  onClick={() => setActiveTab('positions')}
                  className={`flex-1 px-6 py-4 text-sm font-medium transition-colors relative ${
                    activeTab === 'positions'
                      ? 'text-surface-900'
                      : 'text-surface-500 hover:text-surface-700'
                  }`}
                >
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    Positions ({positions.length})
                  </span>
                  {activeTab === 'positions' && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary-600 to-primary-500" />
                  )}
                </button>
                <button
                  onClick={() => setActiveTab('activities')}
                  className={`flex-1 px-6 py-4 text-sm font-medium transition-colors relative ${
                    activeTab === 'activities'
                      ? 'text-surface-900'
                      : 'text-surface-500 hover:text-surface-700'
                  }`}
                >
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                    Activity Feed ({activities.length})
                  </span>
                  {activeTab === 'activities' && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary-600 to-primary-500" />
                  )}
                </button>
              </div>

              <div className="p-6">
                {/* Positions Tab */}
                {activeTab === 'positions' && (
                  <>
                    {positions.length === 0 ? (
                      <div className="py-16 text-center">
                        <div className="w-16 h-16 rounded-2xl bg-surface-100 flex items-center justify-center mx-auto mb-4">
                          <svg className="w-8 h-8 text-surface-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                          </svg>
                        </div>
                        <p className="text-surface-500">No positions yet</p>
                        <p className="text-sm text-surface-400 mt-1">Add addresses to see their current positions</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {positions.map((position, idx) => {
                          const badge = getRankBadge(idx);
                          return (
                            <div
                              key={idx}
                              className={`p-4 rounded-2xl border transition-all ${
                                badge ? `${badge.bg} ${badge.border}` : 'border-surface-100 hover:border-surface-200'
                              }`}
                            >
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-2">
                                    {badge && <span className="text-lg">{badge.emoji}</span>}
                                    <p className="font-semibold text-surface-900 truncate">{position.market}</p>
                                  </div>
                                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
                                    <span className="px-2 py-0.5 bg-surface-100 rounded text-surface-600 font-medium">
                                      {position.outcome}
                                    </span>
                                    <span className="text-surface-500">
                                      {position.totalShares.toLocaleString()} shares
                                    </span>
                                    <span className="text-surface-500">
                                      @ {(position.avgPrice * 100).toFixed(1)}¢ → {(position.currentPrice * 100).toFixed(1)}¢
                                    </span>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="text-lg font-bold text-surface-900">
                                    ${position.totalValue.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                                  </div>
                                  <div className={`text-sm font-semibold ${position.cashPnl >= 0 ? 'text-success-600' : 'text-red-600'}`}>
                                    {position.cashPnl >= 0 ? '+' : ''}${position.cashPnl.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                                    <span className="text-xs ml-1">
                                      ({position.percentPnl >= 0 ? '+' : ''}{position.percentPnl.toFixed(1)}%)
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </>
                )}

                {/* Activity Tab */}
                {activeTab === 'activities' && (
                  <>
                    <div className="flex justify-end mb-4">
                      <button
                        onClick={loadActivities}
                        className="text-xs text-surface-400 hover:text-surface-600 transition-colors flex items-center gap-1"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Refresh
                      </button>
                    </div>
                    {activities.length === 0 ? (
                      <div className="py-16 text-center">
                        <div className="w-16 h-16 rounded-2xl bg-surface-100 flex items-center justify-center mx-auto mb-4">
                          <svg className="w-8 h-8 text-surface-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <p className="text-surface-500">No activities yet</p>
                        <p className="text-sm text-surface-400 mt-1">Add addresses to see their trading activity</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {activities.map((activity, idx) => (
                          <div
                            key={idx}
                            className="p-4 rounded-2xl border border-surface-100 hover:border-surface-200 transition-all"
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex items-start gap-3 flex-1 min-w-0">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                                  activity.type === 'buy'
                                    ? 'bg-success-100'
                                    : activity.type === 'sell'
                                    ? 'bg-red-100'
                                    : 'bg-surface-100'
                                }`}>
                                  {activity.type === 'buy' ? (
                                    <svg className="w-5 h-5 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                                    </svg>
                                  ) : activity.type === 'sell' ? (
                                    <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" />
                                    </svg>
                                  ) : (
                                    <svg className="w-5 h-5 text-surface-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                    </svg>
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-surface-900 truncate">{activity.market}</p>
                                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5 text-sm">
                                    <span className={`${activity.userName ? 'font-medium text-surface-600' : 'font-mono text-xs text-surface-500'}`}>
                                      {formatDisplayName(activity)}
                                    </span>
                                    <span className="text-surface-300">•</span>
                                    <span className={`font-semibold uppercase ${
                                      activity.type === 'buy' ? 'text-success-600' : 'text-red-600'
                                    }`}>
                                      {activity.type}
                                    </span>
                                    <span className="text-surface-300">•</span>
                                    <span className="font-semibold text-surface-900">
                                      ${activity.amount.toLocaleString()}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <span className="text-xs text-surface-400 whitespace-nowrap tabular-nums">
                                {formatTimestamp(activity.timestamp)}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
