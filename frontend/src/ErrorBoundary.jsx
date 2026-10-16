import React from "react";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, message: "" };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, message: error?.message || "Unknown rendering error" };
  }

  componentDidCatch(error) {
    console.error("Skill Connect UI error:", error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <main style={{ fontFamily: "Arial, sans-serif", maxWidth: 720, margin: "48px auto", padding: 24, color: "#20251f", lineHeight: 1.6 }}>
          <h1 style={{ color: "#a33d35" }}>Skill Connect could not load</h1>
          <p>The app hit a display error instead of showing a blank page.</p>
          <pre style={{ whiteSpace: "pre-wrap", background: "#fff0ee", padding: 16, borderRadius: 8 }}>{this.state.message}</pre>
          <p>Copy this error message and send it to ChatGPT so we can fix the exact issue.</p>
          <button onClick={() => window.location.reload()} style={{ padding: "10px 16px", border: 0, borderRadius: 8, background: "#246b4c", color: "white", cursor: "pointer" }}>Reload app</button>
        </main>
      );
    }
    return this.props.children;
  }
}
