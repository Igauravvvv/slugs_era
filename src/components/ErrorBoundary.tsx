import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

export default class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-white flex items-center justify-center px-6">
          <div className="text-center max-w-md">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-[#C0132A]/10 flex items-center justify-center">
              <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="#C0132A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <h1 style={{ fontFamily: "'Trap', Arial, sans-serif" }} className="text-3xl font-light text-[#1A1A1A] mb-3">
              Something went wrong
            </h1>
            <p className="text-sm text-[#888880] mb-8 leading-relaxed">
              We're sorry — an unexpected error occurred. Please try refreshing the page.
            </p>
            <button
              onClick={this.handleReset}
              className="inline-flex items-center gap-2 bg-[#1A1A1A] text-white text-[11px] font-medium tracking-[0.17em] uppercase px-8 py-4 hover:bg-black transition-colors"
            >
              Return to Home
            </button>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <pre className="mt-8 text-left text-xs text-red-600 bg-red-50 p-4 border border-red-200 overflow-auto max-h-48">
                {this.state.error.message}
                {'\n'}
                {this.state.error.stack}
              </pre>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
