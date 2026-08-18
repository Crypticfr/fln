import React, { Component, ErrorInfo, ReactNode } from 'react';
import { ShieldAlert, RefreshCw, LayoutDashboard } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackView?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in component tree:', error, errorInfo);
  }

  public handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.fallbackView) {
      this.props.fallbackView();
    }
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 bg-white dark:bg-slate-900 border border-red-200 dark:border-red-900/50 rounded-2xl shadow-sm text-center space-y-4 max-w-2xl mx-auto my-8">
          <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-950 flex items-center justify-center mx-auto text-red-600 dark:text-red-400">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Something went wrong in this view</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
              An unexpected error occurred while rendering this section. You can reload this view or return to your main dashboard.
            </p>
          </div>
          {this.state.error && (
            <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-lg text-left font-mono text-[11px] text-red-600 dark:text-red-400 border border-slate-200 dark:border-slate-800 overflow-x-auto max-h-32">
              {this.state.error.toString()}
            </div>
          )}
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={this.handleReset}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 transition"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Reload View
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
