import { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  errorMessage: string;
}

/**
 * ErrorBoundary — catches any render-time exceptions in the recommendation flow
 * and shows a friendly "Something went wrong" UI with a retry button.
 */
export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, errorMessage: "" };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, errorMessage: error.message };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[ErrorBoundary] Uncaught error:", error, info);
  }

  handleRetry = () => {
    this.setState({ hasError: false, errorMessage: "" });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center py-24 animate-fadeIn">
          <div
            className="w-24 h-24 rounded-3xl flex items-center justify-center mb-6 shadow-md"
            style={{
              background: "linear-gradient(135deg, #fee2e2, #fecaca)",
            }}
          >
            <span className="text-5xl">🚨</span>
          </div>

          <h2 className="text-2xl font-extrabold text-gray-900 mb-2 tracking-tight">
            Something went wrong
          </h2>
          <p className="text-gray-500 text-sm mb-8 max-w-sm text-center leading-relaxed">
            An unexpected error occurred while loading your recommendations.
            Please try again — your form data won't be lost.
          </p>

          {this.state.errorMessage && (
            <p className="text-xs text-gray-400 font-mono mb-6 px-4 py-2 rounded-xl bg-gray-50 border border-gray-200 max-w-xs text-center break-all">
              {this.state.errorMessage}
            </p>
          )}

          <button
            onClick={this.handleRetry}
            className="btn-primary px-10 py-3.5 rounded-2xl text-base font-bold transition-all duration-300 hover:-translate-y-0.5"
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
