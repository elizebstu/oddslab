import type { ButtonHTMLAttributes } from 'react';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'cyber' | 'danger';
    size?: 'sm' | 'md' | 'lg';
    isLoading?: boolean;
    to?: string;
    children: ReactNode;
}

export default function Button({
    variant = 'primary',
    size = 'md',
    isLoading,
    to,
    children,
    className = '',
    disabled,
    ...props
}: ButtonProps) {
    const baseStyles = 'inline-flex items-center justify-center font-display font-bold tracking-wider uppercase transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none rounded-none skew-x-[-6deg]';

    const variants = {
        primary: 'bg-neon-green text-midnight-950 hover:bg-white hover:shadow-neon-green border-2 border-neon-green',
        secondary: 'bg-neon-cyan text-midnight-950 hover:bg-white hover:shadow-neon-cyan border-2 border-neon-cyan',
        cyber: 'bg-midnight-950 text-neon-cyan border-2 border-neon-cyan hover:bg-neon-cyan hover:text-midnight-950 hover:shadow-neon-cyan shadow-[inset_0_0_10px_rgba(0,240,255,0.2)]',
        outline: 'bg-transparent text-white border-2 border-white/20 hover:border-white hover:bg-white/5',
        ghost: 'bg-transparent text-white/70 hover:text-white hover:bg-white/5 border-none',
        danger: 'bg-neon-red text-midnight-950 hover:bg-white hover:shadow-neon-red border-2 border-neon-red',
    };

    const sizes = {
        sm: 'px-4 py-1.5 text-[10px]',
        md: 'px-6 py-2.5 text-xs',
        lg: 'px-10 py-4 text-sm',
    };

    const content = (
        <span className="skew-x-[6deg] flex items-center gap-2">
            {isLoading ? (
                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
            ) : null}
            {children}
        </span>
    );

    if (to) {
        return (
            <Link to={to} className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}>
                {content}
            </Link>
        );
    }

    return (
        <button
            className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
            disabled={disabled || isLoading}
            {...props}
        >
            {content}
        </button>
    );
}
