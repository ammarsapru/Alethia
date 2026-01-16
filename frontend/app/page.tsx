'use client';
import { useState, useEffect, useRef, use } from 'react';
import BiasPieChart from './biasPieChart';
import SourceList from './sourceList';
import SkeletonLoader from './components/SkeletonLoader';
import TopBar from './components/TopBar';
import { APIResult } from './types';
import logo from './Logo3.png';

// Helper function to format bytes into a readable string (KB, MB, etc.)
function formatBytes(bytes: number, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  if (!bytes) return 'No Data Found';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

// Helper function to get the earliest date from multiple sources
function getEarliestDate(serpDateStr?: string, exifDateStr?: string): string {
  const dates: Date[] = [];

  // Parse SERP date (e.g., "2023-01-15")
  if (serpDateStr) {
    const date = new Date(serpDateStr);
    if (!isNaN(date.getTime())) {
      dates.push(date);
    }
  }

  // Parse EXIF date (e.g., "2023:01:15 10:30:00")
  if (exifDateStr) {
    const formattedExifDate = exifDateStr.replace(/(\d{4}):(\d{2}):(\d{2})/, '$1-$2-$3');
    const date = new Date(formattedExifDate);
    if (!isNaN(date.getTime())) {
      dates.push(date);
    }
  }

  if (dates.length === 0) return '--';

  const earliest = new Date(Math.min.apply(null, dates.map(d => d.getTime())));
  
  return earliest.toLocaleDateString('en-CA'); // YYYY-MM-DD format
}


export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<APIResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showTopBar, setShowTopBar] = useState(true);
  
  // New state for description toggle
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  
  // Ref for hidden file input
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!result) return;

    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      if (window.scrollY > lastScrollY && window.scrollY > 100) {
        setShowTopBar(false);
      } else {
        setShowTopBar(true);
      }
      lastScrollY = window.scrollY;
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [result]);

  const handleFileChange = (selectedFile: File | null) => {
    if (selectedFile) {
      setFile(selectedFile);
      handleUpload(selectedFile);
    }
  };

  const handleUpload = async (fileToUpload: File) => {
    setIsLoading(true);
    setResult(null);
    setError(null);
    setIsDescriptionExpanded(false); // Reset description state

    const formData = new FormData();
    formData.append('file', fileToUpload);

    try {
      const response = await fetch('http://127.0.0.1:8000/search/image', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || 'An unknown error occurred');
      }

      const data = await response.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setResult(null);
    setError(null);
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  const renderUpload = () => (
    <div className="w-full max-w-3xl mx-auto flex flex-col items-center justify-center p-8">
      <div className="flex items-center justify-center mb-6">
        <img src={logo.src} alt="Alethia" className="h-48 md:h-64 w-auto object-contain mix-blend-screen" />
      </div>
      <p className="text-lg text-green-600 text-center mb-8">Uncover the truth behind any image.</p>
      <label
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          handleFileChange(e.dataTransfer.files?.[0] || null);
        }}
        className={`w-full h-64 flex flex-col items-center justify-center p-10 border-2 border-dashed rounded-lg cursor-pointer transition-colors duration-300 ${isDragging ? 'border-green-400 bg-gray-900' : 'border-green-600 hover:border-green-400'}`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-green-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
        </svg>
        <span className="text-green-400 font-medium">
          {file ? file.name : 'Drag & drop an image or click to upload'}
        </span>
        <span className="text-sm text-green-600 mt-1">PNG, JPG, GIF up to 10MB</span>
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
        />
      </label>
    </div>
  );

  const renderResults = () => {
    if (!result) return null;

    const {
      image_description,
      image_url,
      biases = {},
      source_clusters = {},
      earliest_date,
      total_matches,
      exif_data = {},
      ai_analysis = {}, 
    } = result;

    // --- 1. Derive Analysis Data (No useState needed) ---
    
    // Format Verdict
    let formattedVerdict = "--";
    if (ai_analysis.verdict === 'human') formattedVerdict = "Human";
    else if (ai_analysis.verdict === 'ai_generated') formattedVerdict = "AI Generated";
    else if (ai_analysis.verdict === 'deepfake') formattedVerdict = "Deepfake";
    else if (ai_analysis.verdict) formattedVerdict = ai_analysis.verdict; // Fallback

    // Calculate Percentages (0.0 - 1.0 -> 0 - 100)
    const aiScore = (ai_analysis.ai_id_confidence || 0) * 100;
    const humanScore = (ai_analysis.human_confidence || 0) * 100;
    const deepfakeScore = (ai_analysis.deepfake_confidence || 0) * 100;
    
    // NSFW is boolean, so we handle it differently
    const nsfwDetected = ai_analysis.nsfw_is_detected || false;

    // Metadata (Prefer AI analysis data, fallback to EXIF)
    const width = ai_analysis.meta_width || exif_data['Image Width'];
    const height = ai_analysis.meta_height || exif_data['Image Height'];
    const format = ai_analysis.meta_format || exif_data.Format;
    const size = ai_analysis.meta_filesize || exif_data.Size;

    // ----------------------------------------------------

    const imageUrl = image_url.startsWith('http') ? image_url : `http://127.0.0.1:8000${image_url}`;
    
    const finalEarliestDate = getEarliestDate(earliest_date, exif_data['DateTime Original']);
    const noData = 'No Data Found';

    // Check for GPS coordinates
    const gpsLocation = exif_data['GPS Location'];
    const hasLocation = gpsLocation && gpsLocation !== 'N/A' && gpsLocation.trim() !== '';

    return (
      <div className="w-full max-w-7xl mx-auto p-4 md:p-8 grid grid-cols-1 lg:grid-cols-3 gap-x-8 gap-y-12 relative">
        
        {/* Hidden File Input for "New Upload" button */}
        <input
          type="file"
          accept="image/*"
          className="hidden"
          ref={fileInputRef}
          onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
        />

        {/* Main Content Column */}
        <div className="lg:col-span-2 flex flex-col space-y-8">
          
          {/* 1. Image Analysis Section */}
          <section>
            <h2 className="text-2xl font-bold text-green-400 mb-6">Image Analysis</h2>
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <div className="flex-shrink-0 flex items-center justify-center rounded-md bg-black border border-green-500 p-2">
                <img src={imageUrl} alt="Uploaded content" className="max-h-72 w-auto max-w-full sm:max-w-xs object-contain rounded" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-medium text-green-600 uppercase mb-2">Description</h3>
                <div className="relative">
                  <p className={`text-green-300 text-base leading-relaxed ${!isDescriptionExpanded ? 'line-clamp-6' : ''}`}>
                    {image_description || "No description available."}
                  </p>
                  <button 
                    onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                    className="text-green-500 hover:text-green-400 text-sm font-bold mt-2 focus:outline-none underline"
                  >
                    {isDescriptionExpanded ? 'Read Less' : 'Read More'}
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* 2. Upload Button */}
          <div className="flex justify-start">
            <button
              onClick={triggerFileUpload}
              className="px-8 py-3 bg-green-600 hover:bg-green-500 text-black font-bold rounded shadow-lg transition-colors border border-green-400 w-full md:w-auto text-center"
            >
              Upload New Image
            </button>
          </div>

          {/* 3. Verification Report */}
          <section className="bg-black border border-green-500 p-5 rounded-lg">
              <h2 className="text-xl font-bold text-green-400 mb-4">Verification Report</h2>
              <dl className="space-y-4">
                  <div className="flex justify-between items-center border-b border-green-900/50 pb-2">
                      <dt className="text-sm font-medium text-green-600">Total Matches</dt>
                      <dd className="text-base text-green-300 font-mono">{total_matches || 0}</dd>
                  </div>
                  <div className="flex justify-between items-center border-b border-green-900/50 py-2">
                      <dt className="text-sm font-medium text-green-600">Earliest Date</dt>
                      <dd className="text-base text-green-300 font-mono">{finalEarliestDate}</dd>
                  </div>
                  <div className="flex justify-between items-center pt-2">
                      <dt className="text-sm font-medium text-green-600">AI or Not</dt>
                      <dd className="text-base text-green-300 font-mono">{formattedVerdict}</dd>
                  </div>
              </dl>
          </section>

          {/* 4. EXIF Data */}
          <section className="bg-black border border-green-500 p-5 rounded-lg">
              <h2 className="text-xl font-bold text-green-400 mb-4">EXIF Data</h2>
              <div className="space-y-3 text-sm">
                  <div className="flex justify-between border-b border-green-900/50 pb-2">
                      <span className="text-green-600">Device</span>
                      <span className="text-green-300 font-mono">
                        {exif_data.Make || exif_data.Model ? `${exif_data.Make || ''} ${exif_data.Model || ''}`.trim() : noData}
                      </span>
                  </div>
                  <div className="flex justify-between border-b border-green-900/50 pb-2">
                      <span className="text-green-600">Exposure</span>
                      <span className="text-green-300 font-mono">{exif_data.Exposure || noData}</span>
                  </div>
                  <div className="flex justify-between border-b border-green-900/50 pb-2">
                      <span className="text-green-600">Focal Length</span>
                      <span className="text-green-300 font-mono">{exif_data['Focal Length'] ? `${exif_data['Focal Length']}mm` : noData}</span>
                  </div>
                  <div className="flex justify-between pt-1">
                      <span className="text-green-600">ISO</span>
                      <span className="text-green-300 font-mono">{exif_data.ISO || noData}</span>
                  </div>
              </div>
          </section>

          {/* 5. Map */}
          <section className="bg-black border border-green-500 p-5 rounded-lg flex flex-col min-h-[300px]">
              <h2 className="text-xl font-bold text-green-400 mb-4">Location</h2>
              <div className="flex-1 bg-green-900/10 rounded border border-green-800/50 flex flex-col items-center justify-center relative overflow-hidden group">
                  {hasLocation ? (
                    <iframe
                      width="100%"
                      height="100%"
                      frameBorder="0"
                      scrolling="no"
                      marginHeight={0}
                      marginWidth={0}
                      title="Location Map"
                      src={`https://maps.google.com/maps?q=${encodeURIComponent(gpsLocation)}&t=&z=13&ie=UTF8&iwloc=&output=embed`}
                      className="absolute inset-0 w-full h-full opacity-90 hover:opacity-100 transition-opacity grayscale hover:grayscale-0"
                    ></iframe>
                  ) : (
                    <>
                      <div className="absolute inset-0 opacity-20" 
                           style={{ backgroundImage: 'radial-gradient(circle, #22c55e 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
                      </div>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-green-600 mb-2 z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className="text-green-500 text-sm z-10">Map Data Unavailable</span>
                    </>
                  )}
              </div>
              <div className="mt-4 flex justify-between items-center text-sm">
                  <span className="text-green-600">Coordinates</span>
                  <span className="text-green-300 font-mono">{gpsLocation || noData}</span>
              </div>
          </section>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-8">
          {/* --- Bias Section --- */}
          <section>
            <h2 className="text-2xl font-bold text-green-400 mb-4">Bias</h2>
            <div className="bg-black border border-green-500 p-2 rounded-lg w-full overflow-hidden h-64 flex items-center justify-center">
              {Object.keys(biases).length > 0 ? (
                <BiasPieChart data={biases} height={240} />
              ) : (
                <div className="text-green-500/50 text-sm">No Bias Data Available</div>
              )}
            </div>
          </section>

          {/* --- Sources Section --- */}
          <section>
            <h2 className="text-2xl font-bold text-green-400 mb-4">Sources</h2>
            <div className="bg-black border border-green-500 p-4 rounded-lg max-h-80 overflow-y-auto custom-scrollbar">
              {Object.keys(source_clusters).length > 0 ? (
                <SourceList data={source_clusters} />
              ) : (
                <div className="text-green-500/50 text-sm text-center py-4">No Sources Found</div>
              )}
            </div>
          </section>

          {/* --- AI or Not Breakdown Section --- */}
          <section>
            <h2 className="text-2xl font-bold text-green-400 mb-4">AI Breakdown</h2>
            <div className="bg-black border border-green-500 p-4 rounded-lg space-y-6">
              
              {/* Bars Section */}
              <div className="space-y-4">
                {/* AI Generated */}
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-green-600">AI Generated</span>
                    <span className="text-green-300 font-mono">{aiScore.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-green-900/30 rounded-full h-2">
                    <div 
                      className="bg-green-400 h-2 rounded-full shadow-[0_0_8px_rgba(74,222,128,0.6)] transition-all duration-1000 ease-out" 
                      style={{ width: `${aiScore}%` }}
                    ></div>
                  </div>
                </div>
                
                {/* Human */}
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-green-600">Human</span>
                    <span className="text-green-300 font-mono">{humanScore.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-green-900/30 rounded-full h-2">
                    <div 
                      className="bg-green-400 h-2 rounded-full shadow-[0_0_8px_rgba(74,222,128,0.6)] transition-all duration-1000 ease-out" 
                      style={{ width: `${humanScore}%` }}
                    ></div>
                  </div>
                </div>

                {/* Deepfake */}
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-green-600">Deepfake</span>
                    <span className="text-green-300 font-mono">{deepfakeScore.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-green-900/30 rounded-full h-2">
                    <div 
                      className="bg-green-400 h-2 rounded-full shadow-[0_0_8px_rgba(74,222,128,0.6)] transition-all duration-1000 ease-out" 
                      style={{ width: `${deepfakeScore}%` }}
                    ></div>
                  </div>
                </div>

                {/* NSFW */}
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-green-600">NSFW</span>
                    <span className={`font-mono ${nsfwDetected ? 'text-red-500' : 'text-green-300'}`}>
                      {nsfwDetected ? 'DETECTED' : 'Not Detected'}
                    </span>
                  </div>
                  <div className="w-full bg-green-900/30 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full shadow-[0_0_8px_rgba(74,222,128,0.6)] transition-all duration-1000 ease-out ${nsfwDetected ? 'bg-red-500' : 'bg-green-400'}`}
                      style={{ width: nsfwDetected ? '100%' : '0%' }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Meta Section */}
              <div className="border-t border-green-900/50 pt-4">
                <h3 className="text-green-400 font-bold text-sm mb-3">Metadata</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-green-900/10 p-2 rounded border border-green-900/30">
                    <span className="block text-green-600 text-xs uppercase tracking-wider">Width</span>
                    <span className="block text-green-300 font-mono text-sm">{width ? `${width} px` : noData}</span>
                  </div>
                  <div className="bg-green-900/10 p-2 rounded border border-green-900/30">
                    <span className="block text-green-600 text-xs uppercase tracking-wider">Height</span>
                    <span className="block text-green-300 font-mono text-sm">{height ? `${height} px` : noData}</span>
                  </div>
                  <div className="bg-green-900/10 p-2 rounded border border-green-900/30">
                    <span className="block text-green-600 text-xs uppercase tracking-wider">Format</span>
                    <span className="block text-green-300 font-mono text-sm">{format || noData}</span>
                  </div>
                  <div className="bg-green-900/10 p-2 rounded border border-green-900/30">
                    <span className="block text-green-600 text-xs uppercase tracking-wider">Size</span>
                    <span className="block text-green-300 font-mono text-sm">{size ? formatBytes(size) : noData}</span>
                  </div>
                </div>
              </div>

            </div>
          </section>
        </div>
      </div>
    );
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-4 pt-32 bg-black">
      {result && <TopBar isVisible={showTopBar} onReset={handleReset} />}
      {!result && !isLoading && renderUpload()}
      {isLoading && <SkeletonLoader />}
      {result && !isLoading && renderResults()}
      {error && <div className="mt-4 text-red-500">Error: {error}</div>}
    </main>
  );
}
