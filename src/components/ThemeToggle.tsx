"use client";

import { useState, useEffect } from 'react';

const ThemeToggle = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  // Initialize theme from localStorage or system preference
  useEffect(() => {
    // Check for saved theme preference or use system preference
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    } else {
      setIsDarkMode(false);
      document.documentElement.classList.remove('dark');
    }
  }, []);
  
  // Update theme when toggled
  const toggleTheme = () => {
    if (isDarkMode) {
      // Switch to light mode
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setIsDarkMode(false);
    } else {
      // Switch to dark mode
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setIsDarkMode(true);
    }
  };

  return (
    <button
      onClick={toggleTheme}
      className="inline-flex items-center justify-center h-8 w-14 rounded-full bg-gray-200 dark:bg-gray-700 relative focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <span className="sr-only">{isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}</span>
      
      {/* Toggle track */}
      <span 
        className={`absolute block w-6 h-6 rounded-full bg-white shadow transform transition-transform duration-200 ease-in-out ${
          isDarkMode ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
      
      {/* Sun icon (light mode) */}
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        className={`absolute w-4 h-4 left-2 transition-opacity duration-200 ease-in-out ${
          isDarkMode ? 'opacity-0' : 'opacity-100'
        } text-yellow-500`} 
        fill="none" 
        viewBox="0 0 24 24" 
        stroke="currentColor"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" 
        />
      </svg>
      
      {/* Moon icon (dark mode) */}
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        className={`absolute w-4 h-4 right-2 transition-opacity duration-200 ease-in-out ${
          isDarkMode ? 'opacity-100' : 'opacity-0'
        } text-indigo-200`} 
        fill="none" 
        viewBox="0 0 24 24" 
        stroke="currentColor"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" 
        />
      </svg>
    </button>
  );
};

export default ThemeToggle; 