import React from "react";
import { BsArrowRepeat } from "react-icons/bs";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 text-red-500 dark:text-red-400 bg-white dark:bg-gray-900 w-full">
          <h3>Something went wrong</h3>
          <p>{this.state.error?.message || "An unknown error occurred"}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 px-3 py-1 bg-teal-500 text-white rounded-lg hover:bg-teal-600 flex items-center gap-2 shadow-md"
          >
            <BsArrowRepeat className="h-5 w-5" />
            Retry
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
