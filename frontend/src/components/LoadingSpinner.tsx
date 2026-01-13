interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  fullScreen?: boolean;
}

export default function LoadingSpinner({ size = 'md', text, fullScreen = false }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-12 w-12',
    lg: 'h-16 w-16',
  };

  const spinner = (
    <div className="flex flex-col items-center gap-6">
      <div className={`relative ${sizeClasses[size]}`}>
        {/* Simplified Rings */}
        <div className="absolute inset-0 border border-neon-cyan/20 rotate-45" />
        <div className="absolute inset-0 border border-neon-purple/20 -rotate-45" />

        {/* Spinning Core */}
        <div className="absolute inset-[10%] border-t-2 border-neon-cyan rounded-full animate-spin" />
      </div>

      {text && (
        <div className="relative">
          <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/50">
            {text}
          </span>
        </div>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-[200] flex items-center justify-center bg-midnight-950">
        <div className="relative z-10">{spinner}</div>
      </div>
    );
  }

  return spinner;
}
