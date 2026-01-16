import React from "react";

interface SourceListProps {
  data: Record<string, string[]>;
}

const SourceList: React.FC<SourceListProps> = ({ data }) => {
  if (!data || Object.keys(data).length === 0) {
    return <div className="text-green-600 text-center p-4">No sources found.</div>;
  }

  return (
    <div className="space-y-4">
      {Object.entries(data).map(([domain, links]) => (
        <div key={domain} className="pb-2 border-b border-green-900/30 last:border-0 last:pb-0">
          <h3 className="text-green-400 font-bold text-sm mb-1 capitalize">{domain}</h3>
          <ul className="space-y-1">
            {links.map((link, index) => (
              <li key={index}>
                <a
                  href={link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-green-600 hover:text-green-300 truncate block transition-colors"
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
