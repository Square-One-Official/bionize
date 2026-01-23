import React from 'react';
import ReactDOM from 'react-dom/client';
import '../styles/globals.css';
import Popup from './Popup';

// Create root element for React
const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

// Render the popup component
root.render(
  <React.StrictMode>
    <Popup />
  </React.StrictMode>
); 