import React from 'react';
import {
  ExclamationTriangleIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

/**
 * ErrorBoundary Component - Catches JavaScript errors in child components
 * Provides fallback UI and error reporting
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo
    });

    // Report error to monitoring service if available
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleRetry = () => {
    this.setState(prevState => ({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: prevState.retryCount + 1
    }));
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.handleRetry);
      }

      // Default fallback UI
      return (
        <div className="min-h-[200px] flex items-center justify-center p-6">
          <div className="text-center max-w-md">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/20 mb-4">
              <ExclamationTriangleIcon className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              {this.props.title || 'Something went wrong'}
            </h3>
            
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              {this.props.message || 'An unexpected error occurred. Please try again or contact support if the problem persists.'}
            </p>

            {/* Error details in development */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="text-left mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <summary className="cursor-pointer text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Error Details (Development)
                </summary>
                <pre className="text-xs text-red-600 dark:text-red-400 whitespace-pre-wrap overflow-auto max-h-32">
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={this.handleRetry}
                className="btn btn-primary flex items-center justify-center"
                disabled={this.state.retryCount >= 3}
              >
                <ArrowPathIcon className="h-4 w-4 mr-2" />
                {this.state.retryCount >= 3 ? 'Max retries reached' : 'Try Again'}
              </button>
              
              {this.props.onReset && (
                <button
                  onClick={this.props.onReset}
                  className="btn btn-secondary"
                >
                  Reset
                </button>
              )}
            </div>

            {this.state.retryCount > 0 && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
                Retry attempts: {this.state.retryCount}/3
              </p>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Hook-based error boundary for functional components
 */
export const useErrorHandler = () => {
  const [error, setError] = React.useState(null);

  const resetError = React.useCallback(() => {
    setError(null);
  }, []);

  const captureError = React.useCallback((error) => {
    console.error('Error captured:', error);
    setError(error);
  }, []);

  React.useEffect(() => {
    if (error) {
      // Report error to monitoring service
      console.error('Captured error:', error);
    }
  }, [error]);

  return {
    error,
    captureError,
    resetError,
    hasError: error !== null
  };
};

/**
 * Higher-order component to wrap components with error boundary
 */
export const withErrorBoundary = (Component, errorBoundaryProps = {}) => {
  const WrappedComponent = (props) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
};

/**
 * Lightweight error boundary for specific sections
 */
export const SectionErrorBoundary = ({ children, section = 'section' }) => (
  <ErrorBoundary
    title={`${section} Error`}
    message={`There was an error loading this ${section.toLowerCase()}. Please refresh the page or try again later.`}
    fallback={(error, retry) => (
      <div className="card">
        <div className="card-body p-6 text-center">
          <ExclamationTriangleIcon className="h-8 w-8 text-red-500 mx-auto mb-3" />
          <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
            Failed to load {section.toLowerCase()}
          </h4>
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-4">
            An error occurred while loading this content.
          </p>
          <button
            onClick={retry}
            className="btn btn-sm btn-primary"
          >
            <ArrowPathIcon className="h-3 w-3 mr-1" />
            Retry
          </button>
        </div>
      </div>
    )}
  >
    {children}
  </ErrorBoundary>
);

export default ErrorBoundary;