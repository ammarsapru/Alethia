import React from "react";

interface SourceListProps {
  data: Record<string, string[]>;
  isDarkMode?: boolean;
  accentColor?: 'red' | 'blue';
}

const SourceList: React.FC<SourceListProps> = ({ data, isDarkMode = true, accentColor = 'blue' }) => {
  const accentText = accentColor === 'red' ? 'text-red-500' : (isDarkMode ? 'text-blue-400' : 'text-blue-600');
  const accentHeader = accentColor === 'red' ? 'text-red-700' : (isDarkMode ? 'text-blue-400' : 'text-blue-700');
  const accentLink = accentColor === 'red' ? 'text-red-600 hover:text-red-400' : (isDarkMode ? 'text-blue-400 hover:text-blue-200' : 'text-blue-600 hover:text-blue-800');
  const borderClass = accentColor === 'red' ? 'border-red-100' : (isDarkMode ? 'border-blue-900/30' : 'border-blue-100');

  if (!data || Object.keys(data).length === 0) {
    return (
      <div className={`flex flex-col items-center justify-center p-12 text-center h-full min-h-[300px]`}>
        <div className={`text-5xl mb-6 opacity-30 ${accentText}`}>!</div>
        <div className={`font-mono uppercase tracking-[0.2em] text-sm font-black ${accentText}`}>
          No Data Stream Detected
        </div>
        <div className={`text-xs font-mono uppercase tracking-widest mt-3 opacity-40 ${accentText}`}>
          Network nodes offline or data masked
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {Object.entries(data).map(([domain, links]) => {
        // Ensure links is an array even if backend structure shifts
        const linkArray = Array.isArray(links) ? links : [links];
        
        return (
          <div key={domain} className={`pb-8 border-b transition-colors last:border-0 last:pb-0 ${borderClass}`}>
            <h3 className={`font-black text-xl mb-4 flex items-center gap-4 uppercase font-mono tracking-tighter ${accentHeader}`}>
              <span className={`w-3 h-3 rounded-none rotate-45 ${accentColor === 'red' ? 'bg-red-500' : 'bg-blue-500'}`}></span>
              {domain}
            </h3>
            <ul className="space-y-4">
              {linkArray.map((link: any, index: number) => {
                // Handle objects if backend returns enriched link data
                const url = typeof link === 'object' ? (link.url || link.link) : link;
                const title = typeof link === 'object' ? (link.title || link.snippet) : null;
                
                return (
                  <li key={index} className="flex group items-start">
                    <span className={`mr-4 opacity-30 font-mono text-xs mt-1.5 ${accentText}`}>[{String(index + 1).padStart(2, '0')}]</span>
                    <div className="flex-1 min-w-0">
                      {title && (
                        <div className={`text-xs font-mono uppercase tracking-widest mb-1 opacity-60 ${accentText}`}>
                          {title}
                        </div>
                      )}
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`text-lg truncate block transition-all font-mono tracking-tighter break-all hover:translate-x-2 ${accentLink}`}
                      >
                        {url}
                      </a>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
    </div>
  );
};

export default SourceList;
