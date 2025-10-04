import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(reg => console.log('KQ Service Worker registered'))
      .catch(err => console.log('KQ Service Worker error:', err));
  });
}

const container = document.getElementById('root');
const root = createRoot(container);
root.render(<App />);