import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-black selection:text-white">
      <nav className="w-full border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-6 h-16 flex justify-between items-center">
          <h1 className="text-xl font-bold tracking-tight">Oddslab</h1>
          <div className="flex items-center gap-6 text-sm font-medium">
            {user ? (
              <Link to="/dashboard" className="text-gray-600 hover:text-black transition-colors">
                Dashboard
              </Link>
            ) : (
              <>
                <Link to="/login" className="text-gray-600 hover:text-black transition-colors">
                  Log in
                </Link>
                <Link to="/register" className="bg-black text-white px-4 py-2 rounded-full hover:bg-gray-800 transition-colors">
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 pt-32 pb-20">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-6xl font-bold tracking-tight mb-8 leading-tight">
            Track Smart Money on Polymarket.
          </h2>
          <p className="text-xl text-gray-500 mb-12 leading-relaxed">
            Discover profitable traders. Create rooms to track wallets. <br className="hidden md:block" />
            Monitor activities in real-time.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              to="/explore"
              className="bg-black text-white px-8 py-3.5 rounded-full text-base font-medium hover:bg-gray-800 transition-all"
            >
              Explore Public Rooms
            </Link>
            {!user && (
              <Link
                to="/register"
                className="bg-white text-black border border-gray-200 px-8 py-3.5 rounded-full text-base font-medium hover:bg-gray-50 transition-all"
              >
                Create Your Room
              </Link>
            )}
          </div>
        </div>

        <div className="mt-32 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-8 border border-gray-100 rounded-2xl bg-gray-50/50 hover:bg-gray-50 transition-colors">
            <div className="text-2xl mb-4">🔍</div>
            <h3 className="text-lg font-semibold mb-2">Track Wallets</h3>
            <p className="text-gray-500 text-sm leading-relaxed">Add any Ethereum address and monitor their Polymarket trades effortlessly.</p>
          </div>
          <div className="p-8 border border-gray-100 rounded-2xl bg-gray-50/50 hover:bg-gray-50 transition-colors">
            <div className="text-2xl mb-4">📊</div>
            <h3 className="text-lg font-semibold mb-2">Activity Feed</h3>
            <p className="text-gray-500 text-sm leading-relaxed">See real-time buy, sell, and redeem activities across all tracked wallets.</p>
          </div>
          <div className="p-8 border border-gray-100 rounded-2xl bg-gray-50/50 hover:bg-gray-50 transition-colors">
            <div className="text-2xl mb-4">🔗</div>
            <h3 className="text-lg font-semibold mb-2">Share Publicly</h3>
            <p className="text-gray-500 text-sm leading-relaxed">Make your room public and share your insights with the community.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
