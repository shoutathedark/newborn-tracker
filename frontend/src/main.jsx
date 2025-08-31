import React from 'react';
import ReactDOM from 'react-dom/client';  // Make sure you import from 'react-dom/client'
import App from './App';
import { AuthProvider } from './context/AuthProvider';  // Import your AuthProvider

// Create a root element
const root = ReactDOM.createRoot(document.getElementById('root'));

// Use the root element to render the App component
root.render(
  <AuthProvider>
    <App />
  </AuthProvider>
);
