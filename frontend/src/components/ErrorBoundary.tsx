import React from 'react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  errorMessage: string | null;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, errorMessage: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, errorMessage: error.message };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    // In a production app this would be sent to a logging/monitoring service.
    // Intentionally not using console.log per project conventions.
    void error;
    void errorInfo;
  }

  handleReload = (): void => {
    this.setState({ hasError: false, errorMessage: null });
    window.location.assign('/login');
  };

  render(): React.ReactNode {
    if (this.state.hasError) {
      return (
        <div
          role="alert"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100vh',
            gap: '16px',
            fontFamily: 'var(--font-family-inter)',
            padding: '24px',
            textAlign: 'center',
          }}
        >
          <h1 style={{ color: 'var(--color-primary)' }}>Something went wrong.</h1>
          <p style={{ color: 'var(--color-secondary)' }}>
            {this.state.errorMessage ?? 'An unexpected error occurred.'}
          </p>
          <button
            type="button"
            onClick={this.handleReload}
            style={{
              background: 'var(--color-primary)',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              padding: '12px 24px',
              fontWeight: 700,
            }}
          >
            Return to Login
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
