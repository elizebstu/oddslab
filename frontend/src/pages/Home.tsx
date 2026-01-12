import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import RoomCard from '../components/RoomCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { roomService } from '../services/roomService';
import type { Room } from '../services/roomService';
import { useAuth } from '../hooks/useAuth';

export default function Home() {
  const { user } = useAuth();
  const [featuredRooms, setFeaturedRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFeaturedRooms();
  }, []);

  const loadFeaturedRooms = async () => {
    try {
      const rooms = await roomService.getPublicRooms();
      // Show top 6 rooms with most addresses
      const sorted = rooms
        .sort((a, b) => (b.addresses?.length || 0) - (a.addresses?.length || 0))
        .slice(0, 6);
      setFeaturedRooms(sorted);
    } catch (error) {
      console.error('Failed to load featured rooms:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-50 text-surface-900 font-sans selection:bg-primary-500 selection:text-white">
      <Navbar />

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-accent-50" />
        <div className="absolute inset-0 bg-grid-pattern bg-grid opacity-30" />

        {/* Decorative blobs */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary-400/20 rounded-full blur-3xl" />
        <div className="absolute top-40 right-20 w-96 h-96 bg-accent-400/20 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-16 sm:pt-24 pb-16">
          <div className="max-w-3xl">
            {/* Status Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-primary-100 text-sm text-primary-700 mb-6 animate-fade-in shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-accent-500"></span>
              </span>
              Live Polymarket Data
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6 leading-[1.1] animate-slide-up">
              Track Smart Money
              <br />
              <span className="bg-gradient-to-r from-primary-600 via-primary-500 to-accent-500 bg-clip-text text-transparent">
                on Polymarket
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-lg sm:text-xl text-surface-600 mb-8 max-w-xl leading-relaxed">
              Follow the most profitable traders. Create watchlists. Monitor positions and trades in real-time.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              {user ? (
                <Link
                  to="/dashboard"
                  className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-primary-600 to-primary-500 text-white px-6 py-3.5 rounded-xl text-base font-medium hover:from-primary-700 hover:to-primary-600 transition-all hover:shadow-xl hover:shadow-primary-500/25 hover:-translate-y-0.5"
                >
                  Go to Dashboard
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              ) : (
                <>
                  <Link
                    to="/register"
                    className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-primary-600 to-primary-500 text-white px-6 py-3.5 rounded-xl text-base font-medium hover:from-primary-700 hover:to-primary-600 transition-all hover:shadow-xl hover:shadow-primary-500/25 hover:-translate-y-0.5"
                  >
                    Start Tracking
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </Link>
                  <Link
                    to="/explore"
                    className="inline-flex items-center justify-center gap-2 bg-white text-surface-900 border border-surface-200 px-6 py-3.5 rounded-xl text-base font-medium hover:bg-surface-50 hover:border-surface-300 transition-all shadow-sm"
                  >
                    Explore Rooms
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-3 gap-4 sm:gap-8 max-w-lg">
            <div className="text-center sm:text-left">
              <div className="text-2xl sm:text-3xl font-bold text-surface-900">{featuredRooms.length}+</div>
              <div className="text-sm text-surface-500">Public Rooms</div>
            </div>
            <div className="text-center sm:text-left">
              <div className="text-2xl sm:text-3xl font-bold text-surface-900">
                {featuredRooms.reduce((sum, r) => sum + (r.addresses?.length || 0), 0)}+
              </div>
              <div className="text-sm text-surface-500">Wallets Tracked</div>
            </div>
            <div className="text-center sm:text-left">
              <div className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-accent-600 to-accent-500 bg-clip-text text-transparent">Live</div>
              <div className="text-sm text-surface-500">Data Feed</div>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Rooms Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold tracking-tight mb-2">Featured Rooms</h2>
            <p className="text-surface-500">Explore curated watchlists from the community</p>
          </div>
          <Link
            to="/explore"
            className="hidden sm:inline-flex items-center gap-2 text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors"
          >
            View all
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner text="Loading rooms..." />
          </div>
        ) : featuredRooms.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredRooms.map((room) => (
                <RoomCard key={room.id} room={room} />
              ))}
            </div>
            <div className="mt-8 text-center sm:hidden">
              <Link
                to="/explore"
                className="inline-flex items-center gap-2 text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors"
              >
                View all rooms
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          </>
        ) : (
          <div className="bg-white border border-surface-200 rounded-3xl p-12 text-center shadow-card">
            <div className="w-16 h-16 rounded-2xl bg-primary-50 flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">No public rooms yet</h3>
            <p className="text-surface-500 mb-6">Be the first to create and share a room</p>
            <Link
              to="/register"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-primary-600 to-primary-500 text-white px-6 py-3 rounded-full text-sm font-medium hover:from-primary-700 hover:to-primary-600 transition-all shadow-lg shadow-primary-500/25"
            >
              Create Your First Room
            </Link>
          </div>
        )}
      </div>

      {/* Features Section */}
      <div className="bg-white border-t border-surface-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-4">Why Oddslab?</h2>
            <p className="text-surface-500 max-w-xl mx-auto">
              Everything you need to follow and analyze Polymarket's top performers
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="group text-center p-6">
              <div className="w-14 h-14 rounded-2xl bg-primary-50 flex items-center justify-center mx-auto mb-5 group-hover:bg-gradient-to-br group-hover:from-primary-500 group-hover:to-primary-600 transition-all duration-300">
                <svg className="w-7 h-7 text-primary-600 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Discover Traders</h3>
              <p className="text-surface-500 text-sm leading-relaxed">
                Find wallets by address or Polymarket username. Track anyone with a public trading history.
              </p>
            </div>

            <div className="group text-center p-6">
              <div className="w-14 h-14 rounded-2xl bg-accent-50 flex items-center justify-center mx-auto mb-5 group-hover:bg-gradient-to-br group-hover:from-accent-500 group-hover:to-accent-600 transition-all duration-300">
                <svg className="w-7 h-7 text-accent-600 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Analyze Positions</h3>
              <p className="text-surface-500 text-sm leading-relaxed">
                View aggregated positions with P&L tracking. See what the smart money is betting on.
              </p>
            </div>

            <div className="group text-center p-6">
              <div className="w-14 h-14 rounded-2xl bg-success-50 flex items-center justify-center mx-auto mb-5 group-hover:bg-gradient-to-br group-hover:from-success-500 group-hover:to-success-600 transition-all duration-300">
                <svg className="w-7 h-7 text-success-600 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Real-time Updates</h3>
              <p className="text-surface-500 text-sm leading-relaxed">
                Get live activity feeds showing every buy, sell, and redemption as they happen.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      {!user && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
          <div className="relative overflow-hidden bg-gradient-to-r from-primary-600 via-primary-500 to-accent-500 rounded-3xl p-8 sm:p-12 text-center">
            <div className="absolute inset-0 bg-grid-pattern bg-grid opacity-10" />
            <div className="relative">
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">Ready to start tracking?</h2>
              <p className="text-primary-100 mb-8 max-w-lg mx-auto">
                Create your free account and build your first watchlist in under a minute.
              </p>
              <Link
                to="/register"
                className="inline-flex items-center justify-center gap-2 bg-white text-primary-600 px-8 py-4 rounded-xl text-base font-medium hover:bg-primary-50 transition-all hover:shadow-xl"
              >
                Get Started Free
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-surface-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2.5">
              <img src="/logo.jpeg" alt="Oddslab" className="w-6 h-6 rounded" />
              <span className="font-semibold bg-gradient-to-r from-primary-600 to-primary-500 bg-clip-text text-transparent">Oddslab</span>
            </div>
            <p className="text-sm text-surface-400">
              Track smart money on Polymarket prediction markets
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
