import React from 'react';
export class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { error: any }> {
  state = { error: null };
  static getDerivedStateFromError(error: any) { return { error }; }
  render() {
    if (this.state.error) {
      return <div style={{ color: 'white', padding: 32 }}>Error: {String(this.state.error)}</div>;
    }
    return this.props.children;
  }
}