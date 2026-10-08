import { Component } from "react";
import { AlertTriangle } from "lucide-react";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    // Still surfaced for debugging — this doesn't replace fixing the root cause
    console.error("Unhandled render error:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <AlertTriangle size={32} strokeWidth={1.5} />
          <p>Something went wrong.</p>
          <span>Try refreshing the page. If this keeps happening, check the browser console.</span>
        </div>
      );
    }
    return this.props.children;
  }
}
