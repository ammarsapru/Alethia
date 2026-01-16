'use client';
import { useState, useEffect, useRef, use } from 'react';
import { 
  Scan, 
  ShieldCheck, 
  Aperture, 
  Map, 
  PieChart, 
  Search, 
  Activity, 
  Layers,
  Upload
} from 'lucide-react';
import BiasPieChart from './biasPieChart';
import SourceList from './sourceList';
import logo from './Logo4.png';
import SkeletonLoader from './components/SkeletonLoader';
import TopBar from './components/TopBar';
import { APIResult } from './types';

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
  
  // New states
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  
  // Ref for hidden file input
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Sync theme class to body for scrollbar styling
    if (!isDarkMode) {
      document.body.classList.add('light-theme');
    } else {
      document.body.classList.remove('light-theme');
    }
  }, [isDarkMode]);

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
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center justify-center py-20 px-8">
      {/* Centered Logo above the subline */}
      <div className="mb-12 hover:scale-105 transition-transform duration-300">
        <img 
          src={logo.src} 
          alt="Alethia Logo" 
          className={`h-64 w-auto object-contain mix-blend-screen ${!isDarkMode ? 'invert grayscale' : ''}`} 
        />
      </div>

      {/* Subline */}
      <div className="mb-16 space-y-2 text-center">
        <p className="text-xl text-blue-500 font-mono tracking-[0.4em] uppercase font-black">Forensic Image Intelligence</p>
        <div className="h-0.5 w-24 bg-blue-600 mx-auto opacity-50"></div>
      </div>

      {/* Upload Zone */}
      <label
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          handleFileChange(e.dataTransfer.files?.[0] || null);
        }}
        className={`w-full max-w-2xl futuristic-panel p-2 cursor-pointer transition-all duration-500 group ${
          isDragging 
            ? 'ring-2 ring-blue-400 bg-blue-900/20' 
            : (isDarkMode ? 'hover:bg-blue-900/5' : 'hover:bg-blue-50/50')
        }`}
      >
        <div className={`flex flex-col items-center justify-center p-12 border border-blue-900/30 transition-colors ${isDarkMode ? 'bg-black/40' : 'bg-white'}`}>
          <div className="p-6 bg-blue-600 rounded-none mb-6 shadow-[0_0_20px_rgba(59,130,246,0.4)] group-hover:scale-110 transition-transform">
            <Upload className="h-10 w-10 text-black" strokeWidth={2.5} />
          </div>
          
          <span className={`font-mono font-bold uppercase tracking-[0.2em] mb-3 text-center transition-colors ${isDarkMode ? 'text-blue-300' : 'text-blue-900'}`}>
            {file ? file.name : 'Initialize Data Stream'}
          </span>
          
          <span className={`text-[10px] font-mono uppercase tracking-[0.3em] font-black transition-colors ${isDarkMode ? 'text-blue-700' : 'text-blue-400'}`}>
            Drag & drop or click to upload source
          </span>

          {/* Background Stats HUD Decorations */}
          <div className="absolute bottom-4 left-4 flex gap-4 opacity-20 pointer-events-none">
            <div className="space-y-1">
              <div className="h-1 w-12 bg-blue-500"></div>
              <div className="h-1 w-8 bg-blue-500"></div>
            </div>
            <div className="text-[8px] font-mono text-blue-500">READY_FOR_SCAN</div>
          </div>
        </div>
        
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

    // --- Analysis Data Derivation ---
    
    let formattedVerdict = "UNKNOWN";
    if (ai_analysis.verdict === 'human') formattedVerdict = "VERIFIED HUMAN";
    else if (ai_analysis.verdict === 'ai_generated') formattedVerdict = "AI GENERATED";
    else if (ai_analysis.verdict === 'deepfake') formattedVerdict = "DEEPFAKE DETECTED";
    else if (ai_analysis.verdict) formattedVerdict = ai_analysis.verdict.toUpperCase();

    const aiScore = (ai_analysis.ai_id_confidence || 0) * 100;
    const humanScore = (ai_analysis.human_confidence || 0) * 100;
    const deepfakeScore = (ai_analysis.deepfake_confidence || 0) * 100;
    const nsfwDetected = ai_analysis.nsfw_is_detected || false;

    const imageUrl = image_url.startsWith('http') ? image_url : `http://127.0.0.1:8000${image_url}`;
    const finalEarliestDate = getEarliestDate(earliest_date, exif_data['DateTime Original']);

    const gpsLocation = exif_data['GPS Location'];
    const hasLocation = gpsLocation && gpsLocation !== 'N/A' && gpsLocation.trim() !== '';

    return (
      <div className="w-full max-w-[1600px] mx-auto space-y-20 pb-20">
        {/* Hidden File Input */}
        <input
          type="file"
          accept="image/*"
          className="hidden"
          ref={fileInputRef}
          onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
        />

        {/* PARTITION 1: HERO (Snap to Viewport) */}
        <section className="min-h-[calc(100vh-120px)] flex flex-col items-center justify-center space-y-12 py-10">
          {/* Row 1: Upload Button (Logo removed from results page as per request) */}
          <div className="flex justify-center">
            <button
              onClick={triggerFileUpload}
              onDragOver={(e) => {
                e.preventDefault();
                e.currentTarget.classList.add('ring-4', 'ring-blue-400', 'scale-105');
              }}
              onDragLeave={(e) => {
                e.currentTarget.classList.remove('ring-4', 'ring-blue-400', 'scale-105');
              }}
              onDrop={(e) => {
                e.preventDefault();
                e.currentTarget.classList.remove('ring-4', 'ring-blue-400', 'scale-105');
                handleFileChange(e.dataTransfer.files?.[0] || null);
              }}
              className="px-10 py-4 bg-blue-600 hover:bg-blue-500 text-black font-black flex items-center gap-3 transition-all border border-blue-400 font-mono uppercase tracking-[0.25em] shadow-[0_0_25px_rgba(59,130,246,0.3)] hover:shadow-[0_0_40px_rgba(59,130,246,0.5)] active:scale-95"
            >
              <Upload className="h-6 w-6" />
              Upload New Image
            </button>
          </div>

          {/* Row 2: Equal Split Hero (Predefined sizing) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-stretch w-full px-4 max-w-[1400px]">
              {/* Image Partition (1/2) */}
              <div className="w-full flex flex-col space-y-4">
                  <div className="flex items-center gap-3 text-blue-500 font-mono text-xs tracking-[0.3em] uppercase opacity-70">
                      <Layers className="h-5 w-5" />
                      Visual Source Data
                  </div>
                  <div className={`futuristic-panel p-2 flex items-center justify-center ring-1 ring-blue-500/20 w-full h-[500px] overflow-hidden group relative transition-colors ${isDarkMode ? 'bg-black/80' : 'bg-white'}`}>
                      <img 
                        src={imageUrl} 
                        alt="Analyzed content" 
                        className="max-h-full w-auto max-w-full object-contain transition-transform duration-700 group-hover:scale-[1.05]" 
                      />
                      {/* Technical Overlay */}
                      <div className="absolute top-4 left-4 flex gap-2 items-center">
                        <div className="w-2 h-2 bg-blue-500 animate-pulse"></div>
                        <div className="text-[10px] text-blue-500 font-mono uppercase tracking-tighter">Forensic Scan Active</div>
                      </div>
                  </div>
              </div>

              {/* Description Partition (1/2) */}
              <div className="w-full flex flex-col space-y-4">
                  <div className="flex items-center gap-3 text-blue-500 font-mono text-xs tracking-[0.3em] uppercase opacity-70">
                      <Scan className="h-5 w-5" />
                      Visual Narrative Analysis
                  </div>
                  <div className={`futuristic-panel p-8 h-[500px] flex flex-col relative box-border transition-colors ${isDarkMode ? 'bg-blue-950/5' : 'bg-white'}`}>
                      <div className="flex-1 overflow-y-auto custom-scrollbar pr-4">
                        <p className={`text-lg leading-[1.8] font-sans transition-colors ${isDarkMode ? 'text-blue-200' : 'text-slate-800'} ${!isDescriptionExpanded ? 'line-clamp-[10]' : ''}`}>
                            <span className="text-blue-500 font-mono font-bold mr-2 text-2xl">[ID-001]</span>
                            {image_description || "Processing visual data nodes... Extracting narrative metadata."}
                        </p>
                      </div>
                      
                      {/* Read More Toggle */}
                      <div className={`mt-4 pt-4 flex justify-between items-center bg-transparent border-t transition-colors ${isDarkMode ? 'border-blue-900/40' : 'border-blue-100'}`}>
                          <button 
                            onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                            className="text-blue-500 hover:text-blue-400 text-xs font-mono font-black uppercase tracking-widest flex items-center gap-2 transition-colors focus:outline-none"
                          >
                            {isDescriptionExpanded ? '[ CLOSE_STREAM ]' : '[ READ_FULL_INTEL ]'}
                          </button>
                          <div className="text-[10px] text-blue-700 font-mono uppercase tracking-widest whitespace-nowrap">Confidence: 98.4% | Model: Alethia-AI</div>
                      </div>
                  </div>
              </div>
          </div>
        </section>

        {/* PARTITION 2: DATA BREAKDOWN */}
        <section className="min-h-screen flex flex-col justify-center py-20 px-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Column 1: Bias & Sources */}
                <div className="space-y-10">
                    <section className="space-y-4">
                        <div className={`flex items-center gap-3 font-mono uppercase tracking-widest text-xs font-black transition-colors ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                            <PieChart className="h-5 w-5" />
                            I. Narrative Bias Matrix
                        </div>
                        <div className={`futuristic-panel p-4 h-[320px] flex items-center justify-center overflow-hidden transition-colors ${isDarkMode ? 'bg-black/80' : 'bg-white'}`}>
                            {Object.keys(biases).length > 0 ? (
                              <BiasPieChart data={biases} height={280} isDarkMode={isDarkMode} />
                            ) : (
                              <div className={`font-mono text-xs uppercase tracking-widest ${isDarkMode ? 'text-blue-500/20' : 'text-blue-900/40'}`}>Metadata insufficient for bias analysis</div>
                            )}
                        </div>
                    </section>
                    <section className="space-y-4">
                        <div className={`flex items-center gap-3 font-mono uppercase tracking-widest text-xs font-black transition-colors ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                            <Search className="h-5 w-5" />
                            II. Source Intelligence
                        </div>
                        <div className={`futuristic-panel p-1 h-[420px] overflow-hidden transition-colors ${isDarkMode ? 'bg-black/80' : 'bg-white'}`}>
                            <div className="h-full overflow-y-auto custom-scrollbar p-5">
                                <SourceList data={source_clusters} isDarkMode={isDarkMode} />
                            </div>
                        </div>
                    </section>
                </div>

                {/* Column 2: Verification & AI Breakdown */}
                <div className="space-y-10">
                    <section className="space-y-4">
                        <div className={`flex items-center gap-3 font-mono uppercase tracking-widest text-xs font-black transition-colors ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                            <ShieldCheck className="h-5 w-5" />
                            III. Integrity Verification
                        </div>
                        <div className={`futuristic-panel p-8 transition-colors ${isDarkMode ? 'bg-black/80' : 'bg-white'}`}>
                            <dl className="space-y-6">
                                <div className={`flex justify-between items-center border-b pb-3 transition-colors ${isDarkMode ? 'border-blue-900/40' : 'border-blue-100'}`}>
                                    <dt className="text-xs font-bold text-blue-600 font-mono uppercase tracking-wider">Total Matches</dt>
                                    <dd className={`text-lg font-mono font-bold transition-colors ${isDarkMode ? 'text-blue-300' : 'text-blue-900'}`}>{total_matches || 0}</dd>
                                </div>
                                <div className={`flex justify-between items-center border-b pb-3 transition-colors ${isDarkMode ? 'border-blue-900/40' : 'border-blue-100'}`}>
                                    <dt className="text-xs font-bold text-blue-600 font-mono uppercase tracking-wider">Earliest Intel</dt>
                                    <dd className={`text-base font-mono transition-colors ${isDarkMode ? 'text-blue-300' : 'text-blue-800'}`}>{finalEarliestDate || "Unknown"}</dd>
                                </div>
                                <div className="flex justify-between items-center">
                                    <dt className="text-xs font-bold text-blue-600 font-mono uppercase tracking-wider">Synthesis Result</dt>
                                    <dd className={`text-base font-mono font-bold tracking-tight transition-colors ${isDarkMode ? 'text-blue-300' : 'text-blue-900'}`}>{formattedVerdict}</dd>
                                </div>
                            </dl>
                        </div>
                    </section>
                    <section className="space-y-4">
                        <div className={`flex items-center gap-3 font-mono uppercase tracking-widest text-xs font-black transition-colors ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                            <Activity className="h-5 w-5" />
                            IV. Neural Synthesis Breakdown
                        </div>
                        <div className={`futuristic-panel p-8 space-y-8 transition-colors ${isDarkMode ? 'bg-black/80' : 'bg-white'}`}>
                            {/* Bars Section */}
                            <div className="space-y-6">
                              {[
                                { label: 'AI Generated', score: aiScore, color: 'bg-blue-500' },
                                { label: 'Human Capture', score: humanScore, color: 'bg-blue-400' },
                                { label: 'Deepfake Tech', score: deepfakeScore, color: 'bg-blue-600' }
                              ].map((item) => (
                                <div key={item.label}>
                                  <div className="flex justify-between text-[10px] mb-2">
                                    <span className="text-blue-600 font-mono uppercase tracking-widest font-black">{item.label}</span>
                                    <span className={`font-mono transition-colors ${isDarkMode ? 'text-blue-300' : 'text-blue-900'}`}>{item.score.toFixed(1)}%</span>
                                  </div>
                                  <div className={`w-full h-1.5 overflow-hidden transition-colors ${isDarkMode ? 'bg-blue-950/50' : 'bg-blue-100'}`}>
                                    <div 
                                      className={`${item.color} h-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(59,130,246,0.5)]`} 
                                      style={{ width: `${item.score}%` }}
                                    ></div>
                                  </div>
                                </div>
                              ))}

                              {/* NSFW Toggle */}
                              <div className={`pt-4 border-t transition-colors ${isDarkMode ? 'border-blue-900/30' : 'border-blue-100'}`}>
                                <div className="flex justify-between items-center">
                                  <span className="text-blue-600 font-mono uppercase text-[10px] tracking-widest font-black">Content Filter (NSFW)</span>
                                  <span className={`font-mono text-[10px] px-2 py-1 border font-bold transition-colors ${nsfwDetected ? 'text-red-500 border-red-900 bg-red-950/20 shadow-[0_0_10px_rgba(239,68,68,0.2)]' : (isDarkMode ? 'text-blue-500 border-blue-900 bg-blue-950/20' : 'text-blue-700 border-blue-200 bg-blue-50')}`}>
                                    {nsfwDetected ? 'RESTRICTED' : 'SECURE'}
                                  </span>
                                </div>
                              </div>
                            </div>
                        </div>
                    </section>
                </div>

                {/* Column 3: Location & EXIF */}
                <div className="space-y-10">
                    <section className="space-y-4">
                        <div className={`flex items-center gap-3 font-mono uppercase tracking-widest text-xs font-black transition-colors ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                            <Map className="h-5 w-5" />
                            V. Geospatial Origin
                        </div>
                        <div className={`futuristic-panel overflow-hidden h-[380px] transition-colors ${isDarkMode ? 'bg-blue-950/5' : 'bg-white'}`}>
                            <div className="w-full h-full relative">
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
                                  className={`absolute inset-0 w-full h-full transition-all duration-700 ${isDarkMode ? 'opacity-80 hover:opacity-100 grayscale hover:grayscale-0' : 'opacity-100'}`}
                                ></iframe>
                              ) : (
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                  <Map className={`h-10 w-10 mb-3 transition-colors ${isDarkMode ? 'text-blue-900/40' : 'text-blue-200'}`} />
                                  <span className={`text-[10px] font-mono uppercase tracking-[0.3em] transition-colors ${isDarkMode ? 'text-blue-700' : 'text-blue-300'}`}>GPS Metadata Redacted</span>
                                </div>
                              )}
                            </div>
                        </div>
                        <div className="flex justify-between items-center px-1">
                            <span className="text-[10px] text-blue-600 font-mono uppercase">Reference</span>
                            <span className={`text-[10px] font-mono transition-colors ${isDarkMode ? 'text-blue-400' : 'text-blue-700'}`}>{gpsLocation || "HIDDEN_COORDS"}</span>
                        </div>
                    </section>
                    <section className="space-y-4">
                        <div className={`flex items-center gap-3 font-mono uppercase tracking-widest text-xs font-black transition-colors ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                            <Aperture className="h-5 w-5" />
                            VI. Optical Signatures
                        </div>
                        <div className={`futuristic-panel p-10 transition-colors ${isDarkMode ? 'bg-blue-950/5' : 'bg-white'}`}>
                            <div className="space-y-5">
                              {[
                                { label: 'Device ID', value: exif_data.Model || exif_data.Make ? `${exif_data.Make || ''} ${exif_data.Model || ''}` : null },
                                { label: 'Iris Logic', value: exif_data['F Number'] || exif_data.Aperture },
                                { label: 'Shutter Matrix', value: exif_data.Exposure || exif_data.ExposureTime },
                                { label: 'ISO Sensitivity', value: exif_data.ISO }
                              ].map((spec) => (
                                <div key={spec.label} className={`flex justify-between items-center border-b pb-3 transition-colors ${isDarkMode ? 'border-blue-900/20' : 'border-blue-100'}`}>
                                  <span className="text-[10px] text-blue-700 font-mono uppercase font-black">{spec.label}</span>
                                  <span className={`text-sm font-mono transition-colors ${isDarkMode ? 'text-blue-300' : 'text-slate-700'}`}>{spec.value || "NOT DETECTED"}</span>
                                </div>
                              ))}
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </section>
      </div>
    );
  }

  return (
    <main className={`flex flex-col items-center justify-center min-h-screen p-4 pt-44 transition-colors duration-300 ${isDarkMode ? 'bg-black text-white' : 'bg-white text-black'}`}>
      {result && (
        <TopBar 
          isVisible={showTopBar} 
          onReset={handleReset} 
          isDarkMode={isDarkMode} 
          onThemeToggle={() => setIsDarkMode(!isDarkMode)} 
        />
      )}
      {!result && !isLoading && renderUpload()}
      {isLoading && <SkeletonLoader isDarkMode={isDarkMode} />}
      {result && !isLoading && renderResults()}
      {error && <div className="mt-4 text-red-500">Error: {error}</div>}
    </main>
  );
}
