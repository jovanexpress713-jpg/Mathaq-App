import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Prevent browser/container error toasts when user cancels native Web Share sheets
window.addEventListener('unhandledrejection', (event) => {
  const reason = event.reason;
  if (
    reason?.name === 'AbortError' ||
    reason?.message?.includes('Share canceled') ||
    reason?.message?.includes('canceled') ||
    reason?.message?.includes('cancelled')
  ) {
    event.preventDefault();
  }
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

