import React, { Component, ReactNode } from 'react';
import { InfoIcon, RefreshIcon } from './IconComponents';

interface Props {
  children: ReactNode;
  /** Remounts children when this changes, clearing the error (e.g. on navigation). */
  resetKey?: string;
}

interface State {
  hasError: boolean;
}

/** Keeps a rendering error in one section (e.g. a malformed AI response) from blanking the whole app. */
class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('Section render error:', error, info);
  }

  componentDidUpdate(prevProps: Props) {
    if (this.state.hasError && prevProps.resetKey !== this.props.resetKey) {
      this.setState({ hasError: false });
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="text-center p-12 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-red-200 dark:border-red-800">
          <InfoIcon className="w-12 h-12 mx-auto text-red-500 mb-4" />
          <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-2">
            Something went wrong in this section
          </h3>
          <p className="text-slate-600 dark:text-slate-400 max-w-md mx-auto mb-6">
            This can happen if the AI returned an unexpected response. Your saved progress is not affected.
          </p>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors"
          >
            <RefreshIcon className="w-5 h-5 mr-2" />
            Try Again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
