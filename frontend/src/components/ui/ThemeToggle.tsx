import { useTheme } from '../../context/ThemeContext';

export default function ThemeToggle() {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className="relative p-2 w-10 h-10 flex items-center justify-center bg-midnight-900 border border-white/10 dark:bg-white/5 dark:border-white/10 hover:border-neon-cyan transition-all skew-x-[-6deg] group"
            aria-label="Toggle theme"
        >
            <div className="skew-x-[6deg] relative w-5 h-5">
                {/* Sun Icon */}
                <svg
                    className={`absolute inset-0 w-5 h-5 text-neon-cyan transition-all duration-500 transform ${theme === 'dark' ? 'opacity-0 rotate-90 scale-0' : 'opacity-100 rotate-0 scale-100'
                        }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M12 5a7 7 0 100 14 7 7 0 000-14z"
                    />
                </svg>

                {/* Moon Icon */}
                <svg
                    className={`absolute inset-0 w-5 h-5 text-neon-cyan transition-all duration-500 transform ${theme === 'light' ? 'opacity-0 -rotate-90 scale-0' : 'opacity-100 rotate-0 scale-100'
                        }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                    />
                </svg>
            </div>
        </button>
    );
}
