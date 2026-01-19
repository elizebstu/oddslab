import { type TextareaHTMLAttributes } from 'react';

interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  rows?: number;
}

export default function TextArea({ label, error, className = '', rows = 4, ...props }: TextAreaProps) {
  return (
    <div className="w-full space-y-2">
      {label && (
        <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-neon-cyan glow-text-cyan px-1">
          {label}
        </label>
      )}
      <div className="relative group">
        <textarea
          rows={rows}
          className={`
            w-full bg-card border-2 border-border px-4 py-3 rounded-none
            text-foreground font-mono text-sm placeholder:text-foreground/20
            focus:outline-none focus:border-neon-cyan focus:shadow-neon-cyan
            transition-all group-hover:border-border resize-none
            ${error ? 'border-neon-red shadow-neon-red' : ''}
            ${className}
          `}
          {...props}
        />
        {/* Input Shine Effect */}
        <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent group-focus-within:via-neon-cyan/50" />
      </div>
      {error && (
        <p className="text-[10px] font-bold text-neon-red uppercase tracking-wider px-1 animate-pulse">
          {error}
        </p>
      )}
    </div>
  );
}
