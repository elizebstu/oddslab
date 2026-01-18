import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks/useAuth';
import Button from '../ui/Button';
import LanguageToggle from '../ui/LanguageToggle';


export default function Navbar() {
    const { user, logout } = useAuth();
    const location = useLocation();
    const { t } = useTranslation();

    const isActive = (path: string) => location.pathname === path;

    return (
        <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b-2 border-border">
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
                            {user ? (
                                [
                                    { name: t('nav.explore'), path: '/explore' },
                                    { name: t('nav.feed'), path: '/feed' },
                                    { name: t('nav.dashboard'), path: '/dashboard' },
                                ].map((link) => (
                                    <Link
                                        key={link.path}
                                        to={link.path}
                                        className={`
                            relative py-2 text-xs font-bold uppercase tracking-widest transition-all
                            ${isActive(link.path) ? 'text-neon-green glow-text-green' : 'text-foreground/50 hover:text-foreground'}
                          `}
                                    >
                                        {link.name}
                                        {isActive(link.path) && (
                                            <div className="absolute -bottom-1 left-0 right-0 h-[2px] bg-neon-green shadow-neon-green" />
                                        )}
                                    </Link>
                                ))
                            ) : (
                                <Link
                                    to="/explore"
                                    className={`
                        relative py-2 text-xs font-bold uppercase tracking-widest transition-all
                        ${isActive('/explore') ? 'text-neon-green glow-text-green' : 'text-foreground/50 hover:text-foreground'}
                      `}
                                >
                                    {t('nav.explore')}
                                    {isActive('/explore') && (
                                        <div className="absolute -bottom-1 left-0 right-0 h-[2px] bg-neon-green shadow-neon-green" />
                                    )}
                                </Link>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-3">
                            <LanguageToggle />
                        </div>
                        {user ? (
                            <>
                                <div className="hidden sm:flex flex-col items-end mr-2">
                                    <span className="text-[10px] font-bold text-foreground/30 uppercase tracking-widest">{t('nav.account')}</span>
                                    <span className="text-xs font-mono font-bold text-neon-cyan">{user.email.split('@')[0]}</span>
                                </div>
                                <Button variant="cyber" size="sm" onClick={logout}>
                                    {t('nav.logout')}
                                </Button>
                            </>
                        ) : (
                            <>
                                <Link to="/login" className="text-xs font-bold uppercase tracking-widest text-foreground/50 hover:text-foreground transition-colors">
                                    {t('nav.login')}
                                </Link>
                                <Button variant="primary" size="sm" to="/register">
                                    {t('nav.register')}
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
