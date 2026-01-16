import React from "react";

interface SourceListProps {
  data: Record<string, string[]>;
  isDarkMode?: boolean;
}

const SourceList: React.FC<SourceListProps> = ({ data, isDarkMode = true }) => {
  if (!data || Object.keys(data).length === 0) {
    return <div className={`text-center p-4 font-mono uppercase tracking-tight ${isDarkMode ? 'text-blue-600' : 'text-blue-400'}`}>No sources found.</div>;
  }

  return (
    <div className="space-y-4">
      {Object.entries(data).map(([domain, links]) => (
        <div key={domain} className={`pb-2 border-b last:border-0 last:pb-0 ${isDarkMode ? 'border-blue-900/30' : 'border-blue-100'}`}>
          <h3 className={`font-bold text-sm mb-1 capitalize font-mono tracking-tight ${isDarkMode ? 'text-blue-400' : 'text-blue-700'}`}>{domain}</h3>
          <ul className="space-y-1">
            {links.map((link, index) => (
              <li key={index}>
                <a
                  href={link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`text-xs truncate block transition-colors font-mono tracking-tighter ${isDarkMode ? 'text-blue-600 hover:text-blue-300' : 'text-blue-800 hover:text-blue-500'}`}
                >
                  {link}
                </a>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};

export default SourceList;
