import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import { roomService } from '../services/roomService';
import type { Room } from '../services/roomService';

type SortOption = 'recent' | 'addresses' | 'name';

export default function Explore() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('recent');

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

  const filteredAndSortedRooms = useMemo(() => {
    let result = [...rooms];

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(room =>
        room.name.toLowerCase().includes(query)
      );
    }

    // Sort
    switch (sortBy) {
      case 'recent':
        result.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
        break;
      case 'addresses':
        result.sort((a, b) => (b.addresses?.length || 0) - (a.addresses?.length || 0));
        break;
      case 'name':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
    }

    return result;
  }, [rooms, searchQuery, sortBy]);

  return (
    <div className="min-h-screen bg-surface-50 text-surface-900 font-sans selection:bg-primary-500 selection:text-white">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <span className="flex items-center gap-1.5 text-sm font-medium text-accent-700 bg-accent-50 px-3 py-1.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-accent-500"></span>
              Public Rooms
            </span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Explore</h1>
          <p className="text-surface-500">Discover watchlists shared by the community</p>
        </div>

        {/* Search and Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <svg
              className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search rooms..."
              className="w-full pl-12 pr-4 py-3 bg-white border border-surface-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-300 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* Sort Dropdown */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="appearance-none w-full sm:w-48 px-4 py-3 pr-10 bg-white border border-surface-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-300 transition-all text-sm font-medium cursor-pointer"
            >
              <option value="recent">Most Recent</option>
              <option value="addresses">Most Addresses</option>
              <option value="name">Alphabetical</option>
            </select>
            <svg
              className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400 pointer-events-none"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        {/* Results Count */}
        {!loading && rooms.length > 0 && (
          <div className="mb-6 text-sm text-surface-500">
            {searchQuery ? (
              <>
                Showing {filteredAndSortedRooms.length} of {rooms.length} rooms
                {filteredAndSortedRooms.length === 0 && (
                  <span className="ml-2">
                    — <button onClick={() => setSearchQuery('')} className="text-surface-900 hover:underline">Clear search</button>
                  </span>
                )}
              </>
            ) : (
              <>{rooms.length} public {rooms.length === 1 ? 'room' : 'rooms'}</>
            )}
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div className="flex justify-center py-24">
            <LoadingSpinner text="Loading rooms..." />
          </div>
        ) : rooms.length === 0 ? (
          <EmptyState
            icon={
              <svg className="w-8 h-8 text-surface-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            }
            title="No public rooms yet"
            description="Be the first to create and share a room with the community"
            action={{ label: "Create the First Room", href: "/register" }}
          />
        ) : filteredAndSortedRooms.length === 0 ? (
          <div className="text-center py-16 bg-white border border-surface-200 rounded-3xl">
            <svg className="w-12 h-12 text-surface-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <h3 className="text-lg font-semibold mb-2">No rooms found</h3>
            <p className="text-surface-500 mb-4">No rooms match "{searchQuery}"</p>
            <button
              onClick={() => setSearchQuery('')}
              className="text-sm font-medium text-surface-900 hover:underline"
            >
              Clear search
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAndSortedRooms.map((room) => (
              <Link
                key={room.id}
                to={`/public/${room.id}`}
                className="group bg-white border border-surface-200 rounded-3xl p-6 hover:border-primary-200 hover:shadow-card-hover transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-lg font-semibold tracking-tight text-surface-900 group-hover:text-surface-950 transition-colors">
                    {room.name}
                  </h3>
                  <span className="flex items-center gap-1.5 text-xs font-medium text-accent-700 bg-accent-50 px-2.5 py-1 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent-500"></span>
                    Public
                  </span>
                </div>

                <div className="flex items-center gap-3 text-sm text-surface-500 mb-6">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>{room.addresses?.length || 0} {(room.addresses?.length || 0) === 1 ? 'address' : 'addresses'}</span>
                </div>

                <div className="flex items-center justify-between text-xs text-surface-400 border-t border-surface-100 pt-4">
                  <span>Updated {new Date(room.updatedAt).toLocaleDateString()}</span>
                  <svg className="w-4 h-4 text-surface-300 group-hover:text-surface-500 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
