import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="w-full border-b border-surface-200/60 bg-white/80 backdrop-blur-md sticky top-0 z-50 shadow-nav">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex justify-between items-center">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2.5">
            <img src="/logo.jpeg" alt="Oddslab" className="w-8 h-8 rounded-lg" />
            <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-primary-600 to-primary-500 bg-clip-text text-transparent">
              Oddslab
            </span>
          </Link>

          <div className="hidden sm:flex items-center gap-1">
            <Link
              to="/explore"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive('/explore')
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-surface-500 hover:text-surface-900 hover:bg-surface-50'
              }`}
            >
              Explore
            </Link>
            {user && (
              <Link
                to="/dashboard"
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive('/dashboard')
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-surface-500 hover:text-surface-900 hover:bg-surface-50'
                }`}
              >
                My Rooms
              </Link>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <Link
                to="/dashboard"
                className="sm:hidden text-sm font-medium text-surface-500 hover:text-surface-900 transition-colors"
              >
                My Rooms
              </Link>
              <button
                onClick={logout}
                className="text-sm font-medium text-surface-500 hover:text-surface-900 transition-colors"
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-sm font-medium text-surface-600 hover:text-surface-900 transition-colors"
              >
                Log in
              </Link>
              <Link
                to="/register"
                className="bg-gradient-to-r from-primary-600 to-primary-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-primary-700 hover:to-primary-600 transition-all hover:shadow-lg hover:shadow-primary-500/25"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
