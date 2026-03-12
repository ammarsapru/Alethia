'use client';
import logo from '../alethia_logo_vector_claude.svg';
import { Moon, Sun } from 'lucide-react';

interface TopBarProps {
  onReset?: () => void;
  isDarkMode: boolean;
  onThemeToggle: () => void;
  showLogo?: boolean;
}

const TopBar = ({ onReset, isDarkMode, onThemeToggle, showLogo = true }: TopBarProps) => {
  return (
    <header className={`fixed top-0 left-0 w-full z-50 border-b transition-all duration-300 ${isDarkMode ? 'bg-black/80 border-blue-900/30 backdrop-blur-md' : 'bg-white/80 border-gray-200 backdrop-blur-md'}`}>
      <div className="w-full px-8 md:px-12 relative">
        <div className="flex items-center justify-between h-40">
          {/* Left: Optional Brand Name for Landing */}
          <div className="flex items-center">
             {!showLogo && (
               <span className={`font-sans tracking-[0.2em] font-black text-xl ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                 ALETHIA
               </span>
             )}
          </div>
          
          {/* CENTERED LOGO - Shown if showLogo is true */}
          {showLogo && (
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-2">
              <button 
                onClick={onReset} 
                className="focus:outline-none hover:opacity-90 transition-all duration-300 hover:scale-105"
                title="Alethia Home"
              >
                <img 
                  src={logo.src} 
                  alt="Alethia Logo" 
                  className={`h-22 md:h-24 w-auto object-contain transition-all duration-500 ${!isDarkMode ? 'brightness-0 contrast-125' : 'drop-shadow-[0_0_12px_rgba(59,130,246,0.3)]'}`} 
                />
              </button>
              <span className={`text-xl md:text-2xl font-sans tracking-[0.3em] font-black transition-colors duration-500 ${isDarkMode ? 'text-white' : 'text-blue-900'}`}>
                ALETHIA
              </span>
            </div>
          )}
          
          <div className="flex items-center gap-4">
            {/* Theme Toggle Button */}
            <button 
              onClick={onThemeToggle}
              className={`p-3 rounded-full transition-colors focus:outline-none ring-1 ${isDarkMode ? 'text-blue-500 hover:bg-blue-900/20 ring-blue-900/30' : 'text-blue-600 hover:bg-blue-50 ring-blue-100'}`}
              title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isDarkMode ? <Sun className="h-6 w-6" /> : <Moon className="h-6 w-6" />}
              <span className="sr-only">{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
            </button>

            {/* User Profile Button */}
            <button 
              className={`p-3 rounded-full transition-colors focus:outline-none ring-1 ${isDarkMode ? 'text-blue-600 hover:text-blue-400 hover:bg-blue-900/20 ring-blue-900/30' : 'text-blue-600 hover:text-blue-900 hover:bg-blue-50 ring-blue-100'}`}
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
