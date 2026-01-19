import { Component, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: { componentStack: string }) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

// Hoist static SVG icon to avoid recreating on every render (rendering-hoist-jsx)
const ERROR_ICON = (
  <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
  </svg>
);

/**
 * Error Boundary component to catch JavaScript errors anywhere in the component tree.
 * Displays a fallback UI instead of crashing the entire app.
 *
 * Performance optimizations:
 * - Hoisted static SVG icon
 * - Minimal re-renders through proper state management
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: { componentStack: string }) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="max-w-md w-full bg-card border border-neon-red/50 shadow-neon-red p-12 text-center skew-x-[-2deg]">
            <div className="text-neon-red mb-8">
              {ERROR_ICON}
            </div>
            <h2 className="text-2xl font-black uppercase tracking-tighter mb-4 italic text-foreground">
              Something went wrong
            </h2>
            <p className="text-foreground/60 mb-8 text-sm font-bold uppercase tracking-widest leading-relaxed">
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            <button
              onClick={this.handleReload}
              className="px-8 py-3 bg-neon-red text-midnight-950 font-black text-xs uppercase tracking-widest hover:bg-neon-red/80 transition-all skew-x-[-6deg]"
            >
              <span className="skew-x-[6deg] inline-block">Reload Page</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
