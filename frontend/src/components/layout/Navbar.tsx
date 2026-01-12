import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Button from '../ui/Button';
import ThemeToggle from '../ui/ThemeToggle';


export default function Navbar() {
    const { user, logout } = useAuth();
    const location = useLocation();

    const isActive = (path: string) => location.pathname === path;

    return (
        <nav className="sticky top-0 z-50 bg-midnight-950/80 backdrop-blur-xl border-b-2 border-white/5">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
                <div className="flex justify-between items-center h-20">
                    <div className="flex items-center gap-12">
                        <Link to="/" className="flex items-center gap-3 group">
                            <div className="w-9 h-9 bg-neon-green flex items-center justify-center skew-x-[-6deg] group-hover:shadow-neon-green transition-all duration-300">
                                <span className="text-midnight-950 font-black text-xl skew-x-[6deg]">O</span>
                            </div>
                            <span className="text-xl font-display font-black tracking-tighter text-white group-hover:text-neon-green transition-colors">
                                ODDS<span className="text-white/40">LAB</span>
                            </span>
                        </Link>

                        <div className="hidden md:flex items-center gap-8">
                            {[
                                { name: 'Home', path: '/' },
                                { name: 'Explore', path: '/explore' },
                                { name: 'Dashboard', path: '/dashboard' },
                            ].map((link) => (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    className={`
                    relative py-2 text-xs font-bold uppercase tracking-widest transition-all
                    ${isActive(link.path) ? 'text-neon-green glow-text-green' : 'text-white/50 hover:text-white'}
                  `}
                                >
                                    {link.name}
                                    {isActive(link.path) && (
                                        <div className="absolute -bottom-1 left-0 right-0 h-[2px] bg-neon-green shadow-neon-green" />
                                    )}
                                </Link>
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <ThemeToggle />
                        {user ? (
                            <>
                                <div className="hidden sm:flex flex-col items-end mr-2">
                                    <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Account</span>
                                    <span className="text-xs font-mono font-bold text-neon-cyan">{user.email.split('@')[0]}</span>
                                </div>
                                <Button variant="cyber" size="sm" onClick={logout}>
                                    Logout
                                </Button>
                            </>
                        ) : (
                            <>
                                <Link to="/login" className="text-xs font-bold uppercase tracking-widest text-white/50 hover:text-white transition-colors">
                                    Login
                                </Link>
                                <Button variant="primary" size="sm" to="/register">
                                    Sign Up
                                </Button>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Visual Ticker Line */}
            <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-neon-green/20 to-transparent animate-pulse" />
        </nav>
    );
}
