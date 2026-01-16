'use client';
import logo from '../Logo4.png';
import { Moon, Sun } from 'lucide-react';

interface TopBarProps {
  isVisible: boolean;
  onReset?: () => void;
  isDarkMode: boolean;
  onThemeToggle: () => void;
}

const TopBar = ({ isVisible, onReset, isDarkMode, onThemeToggle }: TopBarProps) => {
  return (
    <header className={`fixed top-0 left-0 right-0 z-50 border-b transition-all duration-300 ${isVisible ? 'translate-y-0' : '-translate-y-full'} ${isDarkMode ? 'bg-black/90 border-blue-900' : 'bg-white/90 border-gray-200'}`}>
      <div className="w-full px-8 md:px-12 relative">
        <div className="flex items-center justify-between h-32">
          {/* Left spacer for symmetry */}
          <div className="w-10"></div>
          
          {/* CENTERED LOGO - Optimized sizing and margins */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
            <button 
              onClick={onReset} 
              className="focus:outline-none hover:opacity-80 transition-all duration-300 hover:scale-105"
              title="Alethia Home"
            >
              <img src={logo.src} alt="Alethia Logo" className={`h-28 w-auto object-contain mix-blend-screen ${!isDarkMode ? 'invert grayscale' : ''}`} />
            </button>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Theme Toggle Button */}
            <button 
              onClick={onThemeToggle}
              className={`p-3 rounded-full transition-colors focus:outline-none ring-1 ${isDarkMode ? 'text-blue-500 hover:bg-blue-900/20 ring-blue-900/30' : 'text-gray-600 hover:bg-gray-100 ring-gray-200'}`}
              title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isDarkMode ? <Sun className="h-6 w-6" /> : <Moon className="h-6 w-6" />}
              <span className="sr-only">{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
            </button>

            {/* User Profile Button */}
            <button 
              className={`p-3 rounded-full transition-colors focus:outline-none ring-1 ${isDarkMode ? 'text-blue-600 hover:text-blue-400 hover:bg-blue-900/20 ring-blue-900/30' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 ring-gray-200'}`}
              title="User Profile"
            >
              <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopBar;
