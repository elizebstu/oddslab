import type { ReactNode } from 'react';

interface CardProps {
    children: ReactNode;
    className?: string;
    hover?: boolean;
    variant?: 'default' | 'neon-green' | 'neon-cyan' | 'neon-purple' | 'neon-red';
}

export default function Card({ children, className = '', hover = false, variant = 'default' }: CardProps) {
    const variantStyles = {
        default: 'border-white/5',
        'neon-green': 'border-neon-green/30 shadow-[inset_0_0_15px_rgba(0,255,136,0.05)]',
        'neon-cyan': 'border-neon-cyan/30 shadow-[inset_0_0_15px_rgba(0,240,255,0.05)]',
        'neon-purple': 'border-neon-purple/30 shadow-[inset_0_0_15px_rgba(191,0,255,0.05)]',
        'neon-red': 'border-neon-red/30 shadow-[inset_0_0_15px_rgba(255,0,60,0.05)]',
    };

    return (
        <div className={`
      relative bg-[var(--card)] border-2 rounded-none overflow-hidden
      ${variantStyles[variant]}
      ${hover ? 'hover:border-foreground/30 hover:bg-[var(--muted)] transition-all duration-300 translate-y-0 hover:-translate-y-1' : ''}
      ${className}
    `}>
            {/* Decorative Scanline Reflection */}
            <div className="absolute inset-0 bg-gradient-to-br from-foreground/5 to-transparent pointer-events-none" />

            {/* Corner Accent */}
            <div className="absolute top-0 right-0 w-8 h-8 bg-[var(--muted)] skew-x-[-45deg] translate-x-4 -translate-y-4 opacity-50" />

            <div className="relative z-10 w-full h-full">
                {children}
            </div>
        </div>
    );
}
