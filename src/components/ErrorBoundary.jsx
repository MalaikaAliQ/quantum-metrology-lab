import React from 'react';
import { RotateCcw } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Tab rendering error:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="card" style={{ marginTop: '20px', textAlign: 'center', padding: '40px 20px' }}>
          <h2 style={{ color: 'var(--red)' }}>Laboratory Module Render Warning</h2>
          <p className="muted">
            An issue occurred while rendering this module section. Click below to reset the view.
          </p>
          <button className="btn primary" onClick={this.handleReset} style={{ marginTop: '16px' }}>
            <RotateCcw size={15} />
            <span>Reload Module</span>
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
