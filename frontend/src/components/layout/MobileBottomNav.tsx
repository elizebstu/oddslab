import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks/useAuth';

interface NavItem {
    path: string;
    label: string;
    icon: string;
}

export default function MobileBottomNav() {
    const { user } = useAuth();
    const location = useLocation();
    const { t } = useTranslation();

    // Don't show on auth pages
    const hideOnPaths = ['/login', '/register'];
    if (hideOnPaths.includes(location.pathname)) {
        return null;
    }

    const navItems: NavItem[] = [];

    // Always add Explore
    navItems.push({
        path: '/explore',
        label: t('nav.explore'),
        icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z',
    });

    // Add Feed and Dashboard only for logged in users
    if (user) {
        navItems.push(
            {
                path: '/feed',
                label: t('nav.feed'),
                icon: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6',
            },
            {
                path: '/dashboard',
                label: t('nav.dashboard'),
                icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z',
            }
        );
    }

    // Add profile link for logged in users
    if (user) {
        navItems.push({
            path: '/account',
            label: t('nav.account'),
            icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
        });
    }

    const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + '/');

    return (
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-xl border-t-2 border-border">
            <div className="flex justify-around items-center h-16 px-2">
                {navItems.map((item) => (
                    <Link
                        key={item.path}
                        to={item.path}
                        className={`
                            flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-all duration-200 min-w-0 flex-1
                            ${isActive(item.path)
                                ? 'text-neon-green'
                                : 'text-foreground/40 hover:text-foreground/70'
                            }
                        `}
                    >
                        <svg
                            className={`w-6 h-6 transition-all duration-200 ${isActive(item.path) ? 'scale-110 drop-shadow-[0_0_8px_rgba(34,197,94,0.5)]' : ''}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            strokeWidth={2}
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                        </svg>
                        <span className="text-[10px] font-bold uppercase tracking-wider truncate">
                            {item.label}
                        </span>
                        {isActive(item.path) && (
                            <div className="absolute bottom-1 w-1 h-1 bg-neon-green rounded-full shadow-neon-green" />
                        )}
                    </Link>
                ))}
            </div>
            {/* Safe area for iOS home indicator */}
            <div className="h-[env(safe-area-inset-bottom)] bg-background" />
        </nav>
    );
}
