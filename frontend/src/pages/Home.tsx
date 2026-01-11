import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white text-gray-900 font-sans selection:bg-black selection:text-white">
      <nav className="w-full border-b border-gray-200/60 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex justify-between items-center">
          <Link to="/" className="text-xl font-bold tracking-tight text-gray-900">
            Oddslab
          </Link>
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
                <Link to="/register" className="bg-black text-white px-5 py-2.5 rounded-full hover:bg-gray-800 transition-all hover:shadow-lg hover:shadow-black/20">
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 pt-32 pb-24">
        <div className="text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 text-sm text-gray-600 mb-8">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            Live Polymarket Data
          </div>
          <h1 className="text-6xl md:text-7xl font-bold tracking-tight mb-8 leading-[1.1]">
            Track Smart Money
            <br />
            <span className="text-gray-400">on Polymarket</span>
          </h1>
          <p className="text-xl text-gray-500 mb-12 leading-relaxed max-w-2xl mx-auto">
            Discover profitable traders. Create rooms to track wallets.
            <br className="hidden md:block" />
            Monitor activities in real-time.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              to="/explore"
              className="bg-black text-white px-8 py-4 rounded-full text-base font-medium hover:bg-gray-800 transition-all hover:shadow-xl hover:shadow-black/20 hover:-translate-y-0.5"
            >
              Explore Public Rooms
            </Link>
            {!user && (
              <Link
                to="/register"
                className="bg-white text-black border border-gray-200 px-8 py-4 rounded-full text-base font-medium hover:bg-gray-50 transition-all hover:border-gray-300 hover:shadow-lg"
              >
                Create Your Room
              </Link>
            )}
          </div>
        </div>

        <div className="mt-32 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="group p-8 bg-white border border-gray-200 rounded-3xl hover:border-gray-300 hover:shadow-xl hover:shadow-gray-100/50 transition-all duration-300 hover:-translate-y-1">
            <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center mb-6 group-hover:bg-black transition-colors duration-300">
              <svg className="w-6 h-6 text-gray-600 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-3">Track Wallets</h3>
            <p className="text-gray-500 text-sm leading-relaxed">
              Add any Ethereum address and monitor their Polymarket trades effortlessly. Get insights into winning strategies.
            </p>
          </div>

          <div className="group p-8 bg-white border border-gray-200 rounded-3xl hover:border-gray-300 hover:shadow-xl hover:shadow-gray-100/50 transition-all duration-300 hover:-translate-y-1">
            <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center mb-6 group-hover:bg-black transition-colors duration-300">
              <svg className="w-6 h-6 text-gray-600 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-3">Activity Feed</h3>
            <p className="text-gray-500 text-sm leading-relaxed">
              See real-time buy, sell, and redeem activities across all tracked wallets. Never miss a trade.
            </p>
          </div>

          <div className="group p-8 bg-white border border-gray-200 rounded-3xl hover:border-gray-300 hover:shadow-xl hover:shadow-gray-100/50 transition-all duration-300 hover:-translate-y-1">
            <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center mb-6 group-hover:bg-black transition-colors duration-300">
              <svg className="w-6 h-6 text-gray-600 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-3">Share Publicly</h3>
            <p className="text-gray-500 text-sm leading-relaxed">
              Make your room public and share your insights with the community. Collaborate and discover together.
            </p>
          </div>
        </div>

        <div className="mt-32 text-center">
          <p className="text-sm text-gray-400 uppercase tracking-widest font-medium mb-8">How it works</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center text-sm font-bold mx-auto mb-4">1</div>
              <h3 className="font-semibold mb-2">Create a Room</h3>
              <p className="text-gray-500 text-sm">Sign up and create your first tracking room</p>
              <div className="hidden md:block absolute top-5 left-[60%] w-[80%] h-px bg-gray-200"></div>
            </div>
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center text-sm font-bold mx-auto mb-4">2</div>
              <h3 className="font-semibold mb-2">Add Addresses</h3>
              <p className="text-gray-500 text-sm">Paste wallet addresses you want to track</p>
              <div className="hidden md:block absolute top-5 left-[60%] w-[80%] h-px bg-gray-200"></div>
            </div>
            <div>
              <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center text-sm font-bold mx-auto mb-4">3</div>
              <h3 className="font-semibold mb-2">Monitor Activity</h3>
              <p className="text-gray-500 text-sm">Watch real-time trades from tracked wallets</p>
            </div>
          </div>
        </div>
      </div>

      <footer className="border-t border-gray-200 py-12">
        <div className="max-w-6xl mx-auto px-6 text-center text-sm text-gray-400">
          <p>Oddslab tracks smart money on Polymarket prediction markets</p>
        </div>
      </footer>
    </div>
  );
}
