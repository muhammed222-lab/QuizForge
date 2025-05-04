import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ThemeProvider } from '@/components/theme/theme-provider';
import './index.css';

// Always use dark theme
const initializeTheme = () => {
  // Set dark theme in localStorage
  localStorage.setItem('quizforge_theme', 'dark');
  return 'dark';
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider defaultTheme={initializeTheme()}>
      <App />
    </ThemeProvider>
  </React.StrictMode>,
);
