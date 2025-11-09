import React, { useState } from "react";

type SourceData = {
  [domain: string]: string[];
};

export default function SourceList({ data }: { data: SourceData }) {
  const [openSource, setOpenSource] = useState<string | null>(null);

  const toggleSource = (domain: string) => {
    setOpenSource(prev => (prev === domain ? null : domain));
  };

  return (
    <div className="w-full space-y-2">
      {Object.entries(data).map(([domain, urls]) => (
        <div key={domain} className="border border-gray-600 rounded-lg shadow-sm">
          <button
            onClick={() => toggleSource(domain)}
            className={`w-full text-left p-4 transition-colors duration-200 ${
              openSource === domain
                ? "bg-[#1f2632] text-white"
                : "bg-[#0d1a2d] hover:bg-[#1a2335] text-white"
            } font-semibold`}
          >
            {domain}
          </button>

          {openSource === domain && (
            <div className="p-4 space-y-2 bg-[#0d1a2d] border-t border-gray-700">
              {urls.map((url, index) => (
                <div key={index} className="text-sm">
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:underline break-words"
                  >
                    {url}
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
    // <div className="w-full space-y-4">
    //   {Object.entries(data).map(([domain, urls]) => (
    //     <div key={domain} className="border rounded shadow">
    //       <button
    //         onClick={() => toggleSource(domain)}
    //         className="w-full text-left p-4 bg-gray-100 hover:bg-gray-200 font-semibold"
    //       >
    //         {domain}
    //       </button>

    //       {openSource === domain && (
    //         <div className="p-4 space-y-2 bg-white border-t">
    //           {urls.map((url, index) => (
    //             <div key={index} className="text-sm">
    //               <a
    //                 href={url}
    //                 target="_blank"
    //                 rel="noopener noreferrer"
    //                 className="text-blue-600 underline"
    //               >
    //                 {url}
    //               </a>
    //             </div>
    //           ))}
    //         </div>
    //       )}
    //     </div>
    //   ))}
    // </div>
  );
}
