'use client';
import logo from '../Logo3.png';

interface TopBarProps {
  isVisible: boolean;
  onReset?: () => void;
}

const TopBar = ({ isVisible, onReset }: TopBarProps) => {
  return (
    <header className={`fixed top-0 left-0 right-0 z-50 bg-black border-b border-green-900 transition-transform duration-300 ${isVisible ? 'translate-y-0' : '-translate-y-full'}`}>
      {/* Increased max-width to push elements further to edges */}
      <div className="w-full px-8 md:px-12">
        {/* Reduced height by 25% (h-32 -> h-24) */}
        <div className="flex items-center justify-between h-24">
          <div className="flex items-center">
            {/* Logo / Home Button - Resets state */}
            <button 
              onClick={onReset} 
              className="flex items-center space-x-3 focus:outline-none hover:opacity-80 transition-opacity"
              title="Go to Home / Reset"
            >
              {/* Reduced logo size proportionally (h-48 -> h-36) */}
              <img src={logo.src} alt="Alethia Logo" className="h-36 w-auto object-contain mix-blend-screen -my-6" />
            </button>
          </div>
          
          <div className="flex items-center space-x-8">
            {/* Explicit New Upload Button */}
            {onReset && (
              <button 
                onClick={onReset}
                className="hidden sm:block px-6 py-2 text-lg font-medium text-green-400 border border-green-600 rounded hover:bg-green-900/30 hover:border-green-400 transition-all"
              >
                New Upload
              </button>
            )}

            {/* User Profile Button */}
            <button 
              className="p-3 rounded-full text-green-600 hover:text-green-400 hover:bg-green-900/20 transition-colors focus:outline-none"
              title="User Profile"
            >
              <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
