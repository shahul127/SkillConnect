import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import ErrorBoundary from "./ErrorBoundary.jsx";
import "./styles.css";

const rootElement = document.getElementById("root");

if (!rootElement) {
  document.body.innerHTML = "<main style='font-family:Arial;padding:24px'><h1>Skill Connect could not start</h1><p>The root element is missing from index.html. Please use the complete project folder from the ZIP.</p></main>";
} else {
  createRoot(rootElement).render(
    <React.StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </React.StrictMode>
  );
}
