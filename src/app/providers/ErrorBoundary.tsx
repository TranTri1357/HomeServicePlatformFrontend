import type { ErrorInfo, ReactNode } from "react";
import { Component } from "react";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = {
    hasError: false,
  };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Keep logging centralized here; replace with Sentry/LogRocket later if needed.
    console.error("Unhandled application error", error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 px-4">
        <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-sm border border-slate-200 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600">
            !
          </div>
          <h1 className="text-xl font-bold text-slate-900">Đã có lỗi xảy ra</h1>
          <p className="mt-2 text-sm text-slate-600">
            Ứng dụng gặp lỗi không mong muốn. Vui lòng tải lại trang hoặc thử lại sau.
          </p>
          {this.state.error?.message ? (
            <p className="mt-3 rounded-xl bg-slate-100 px-3 py-2 text-xs text-slate-500 break-words">
              {this.state.error.message}
            </p>
          ) : null}
          <button
            type="button"
            onClick={this.handleReload}
            className="mt-5 inline-flex items-center justify-center rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700"
          >
            Tải lại trang
          </button>
        </div>
      </div>
    );
  }
}
