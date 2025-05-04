import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ThemeProvider } from '@/components/theme/theme-provider';
import './index.css';

// Initialize theme before rendering
const initializeTheme = () => {
  const savedTheme = localStorage.getItem('quizforge_theme') as 'light' | 'dark' | 'system' | null;
  return savedTheme || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider defaultTheme={initializeTheme()}>
      <App />
    </ThemeProvider>
  </React.StrictMode>,
);
