import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import Button from '../ui/Button';
import LanguageToggle from '../ui/LanguageToggle';


export default function Navbar() {
    const { user, logout } = useAuth();
    const location = useLocation();
    const { t } = useTranslation();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const isActive = (path: string) => location.pathname === path;

    return (
        <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b-2 border-border">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
                <div className="flex justify-between items-center h-20">
                    <div className="flex items-center gap-12">
                        <Link to="/" className="flex items-center gap-3 group" onClick={() => setMobileMenuOpen(false)}>
                            <div className="w-9 h-9 bg-neon-green flex items-center justify-center skew-x-[-6deg] group-hover:shadow-neon-green transition-all duration-300">
                                <span className="text-midnight-950 font-black text-xl skew-x-[6deg]">O</span>
                            </div>
                            <span className="text-xl font-display font-black tracking-tighter text-white group-hover:text-neon-green transition-colors">
                                ODDS<span className="text-white/40">LAB</span>
                            </span>
                        </Link>

                        {/* Desktop Navigation */}
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

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="md:hidden flex flex-col items-center justify-center w-10 h-10 gap-1.5"
                            aria-label="Toggle menu"
                        >
                            <span className={`w-6 h-[2px] bg-neon-green transition-all duration-300 ${mobileMenuOpen ? 'rotate-45 translate-y-2' : ''}`} />
                            <span className={`w-6 h-[2px] bg-neon-green transition-all duration-300 ${mobileMenuOpen ? 'opacity-0' : ''}`} />
                            <span className={`w-6 h-[2px] bg-neon-green transition-all duration-300 ${mobileMenuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
                        </button>

                        {/* Desktop User Menu */}
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

            {/* Mobile Menu Overlay */}
            {mobileMenuOpen && (
                <>
                    {/* Backdrop */}
                    <div
                        className="md:hidden fixed inset-0 top-20 bg-black/60 backdrop-blur-sm z-30 animate-fade-in"
                        onClick={() => setMobileMenuOpen(false)}
                    />
                    {/* Menu Content */}
                    <div className="md:hidden fixed inset-0 top-20 bg-background/95 backdrop-blur-xl z-40 animate-slide-in-right">
                        <div className="flex flex-col p-6 gap-6 h-full">
                            {/* Navigation Links */}
                            <div className="flex flex-col gap-4">
                                {user ? (
                                    <>
                                        <Link
                                            to="/explore"
                                            onClick={() => setMobileMenuOpen(false)}
                                            className={`
                                                flex items-center gap-3 py-3 px-4 rounded-lg border-2 transition-all
                                                ${isActive('/explore')
                                                    ? 'border-neon-green bg-neon-green/10 text-neon-green glow-border-green'
                                                    : 'border-border bg-surface/50 text-foreground/70 hover:border-neon-green/50'
                                                }
                                            `}
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                            </svg>
                                            <span className="text-sm font-bold uppercase tracking-wider">{t('nav.explore')}</span>
                                        </Link>
                                        <Link
                                            to="/feed"
                                            onClick={() => setMobileMenuOpen(false)}
                                            className={`
                                                flex items-center gap-3 py-3 px-4 rounded-lg border-2 transition-all
                                                ${isActive('/feed')
                                                    ? 'border-neon-green bg-neon-green/10 text-neon-green glow-border-green'
                                                    : 'border-border bg-surface/50 text-foreground/70 hover:border-neon-green/50'
                                                }
                                            `}
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                            </svg>
                                            <span className="text-sm font-bold uppercase tracking-wider">{t('nav.feed')}</span>
                                        </Link>
                                        <Link
                                            to="/dashboard"
                                            onClick={() => setMobileMenuOpen(false)}
                                            className={`
                                                flex items-center gap-3 py-3 px-4 rounded-lg border-2 transition-all
                                                ${isActive('/dashboard')
                                                    ? 'border-neon-green bg-neon-green/10 text-neon-green glow-border-green'
                                                    : 'border-border bg-surface/50 text-foreground/70 hover:border-neon-green/50'
                                                }
                                            `}
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                                            </svg>
                                            <span className="text-sm font-bold uppercase tracking-wider">{t('nav.dashboard')}</span>
                                        </Link>
                                    </>
                                ) : (
                                    <Link
                                        to="/explore"
                                        onClick={() => setMobileMenuOpen(false)}
                                        className={`
                                            flex items-center gap-3 py-3 px-4 rounded-lg border-2 transition-all
                                            ${isActive('/explore')
                                                ? 'border-neon-green bg-neon-green/10 text-neon-green glow-border-green'
                                                : 'border-border bg-surface/50 text-foreground/70 hover:border-neon-green/50'
                                            }
                                        `}
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                        <span className="text-sm font-bold uppercase tracking-wider">{t('nav.explore')}</span>
                                    </Link>
                                )}
                            </div>

                            {/* User Section */}
                            <div className="mt-auto pt-6 border-t border-border">
                                {user ? (
                                    <div className="flex flex-col gap-4">
                                        <div className="flex items-center gap-3 px-4 py-2">
                                            <div className="w-10 h-10 bg-neon-cyan/20 rounded-full flex items-center justify-center">
                                                <span className="text-neon-cyan font-bold text-lg">
                                                    {user.email[0].toUpperCase()}
                                                </span>
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-bold text-foreground/30 uppercase tracking-widest">{t('nav.account')}</span>
                                                <span className="text-xs font-mono font-bold text-neon-cyan">{user.email.split('@')[0]}</span>
                                            </div>
                                        </div>
                                        <Button
                                            variant="cyber"
                                            size="sm"
                                            onClick={() => {
                                                logout();
                                                setMobileMenuOpen(false);
                                            }}
                                            className="w-full"
                                        >
                                            {t('nav.logout')}
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="flex flex-col gap-3">
                                        <Link
                                            to="/login"
                                            onClick={() => setMobileMenuOpen(false)}
                                            className="w-full py-3 px-4 rounded-lg border-2 border-border bg-surface/50 text-center text-sm font-bold uppercase tracking-wider text-foreground/70 hover:border-neon-green/50 hover:text-neon-green transition-all"
                                        >
                                            {t('nav.login')}
                                        </Link>
                                        <Button
                                            variant="primary"
                                            size="sm"
                                            to="/register"
                                            onClick={() => setMobileMenuOpen(false)}
                                            className="w-full"
                                        >
                                            {t('nav.register')}
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </>
            )}
        </nav>
    );
}
