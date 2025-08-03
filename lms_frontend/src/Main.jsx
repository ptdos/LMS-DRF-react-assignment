import React from "react"; // Import the core React library for building UI components
import ReactDOM from "react-dom/client"; // Import ReactDOM for rendering React components to the DOM (using the modern root API)
import App from "./App.jsx"; // Import the main App component
import "./index.css" // Import global CSS styles for the application
import { AuthProvider } from "./components/AuthContext.jsx"; // Import the AuthProvider for authentication context

// Entry point: Render the App component into the root DOM node
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode> {/* Enable additional checks and warnings for development */}
    <AuthProvider> {/* Provide authentication context to the entire app */}
      <App /> {/* Render the main App component */}
    </AuthProvider>
  </React.StrictMode>
);

// react assignment