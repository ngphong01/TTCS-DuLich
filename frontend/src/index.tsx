import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './globals.css';

// Load theme from localStorage before rendering
const savedTheme = localStorage.getItem('travelgo:theme') || 'light';
const htmlElement = document.documentElement;

if (savedTheme === 'dark') {
  htmlElement.classList.add('dark');
} else if (savedTheme === 'light') {
  htmlElement.classList.remove('dark');
} else if (savedTheme === 'auto') {
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  if (prefersDark) {
    htmlElement.classList.add('dark');
  } else {
    htmlElement.classList.remove('dark');
  }
}

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<App />);
}
