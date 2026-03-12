'use client';
import React, { useState, useEffect, useRef, use } from 'react';
import { 
  Scan, 
  ShieldCheck, 
  Aperture, 
  Map, 
  PieChart, 
  Search, 
  Activity, 
  Layers,
  Upload,
  ArrowRight,
  Check,
  X,
  Globe,
  Cpu,
  Sun,
  Moon
} from 'lucide-react';
import BiasPieChart from './biasPieChart';
import SourceList from './sourceList';
import logo from './alethia_logo_vector_claude.svg';
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

/**
 * Helper to render the AI analysis text with blue-underlined headers
 */
function renderNarrativeAnalysis(text: string, isDarkMode: boolean) {
  if (!text) return null;

  const accentTextNarrative = isDarkMode ? 'text-blue-500' : 'text-red-600';
  const borderNarrative = isDarkMode ? 'border-blue-500/50' : 'border-red-600/50';

  const lines = text.split('\n');
  
  return lines.map((line, index) => {
    const trimmedLine = line.trim();
    
    const isMarkdownHeader = trimmedLine.startsWith('###');
    const isColonHeader = /^[A-Z\s]{3,}:/.test(trimmedLine);
    
    if (isMarkdownHeader || isColonHeader) {
      let headerText = trimmedLine.replace(/^###\s*/, '').trim();
      let headerLabel = headerText;
      let headerValue = "";

      if (headerText.includes(':')) {
        const parts = headerText.split(':');
        headerLabel = parts[0].trim();
        headerValue = parts.slice(1).join(':').trim();
      }

      return (
        <div key={index} className="mt-8 mb-4">
          <span className={`${accentTextNarrative} font-black border-b-2 ${borderNarrative} uppercase tracking-[0.2em] text-xl pb-1 inline-block`}>
            {headerLabel} {headerValue && <span className={`ml-3 ${accentTextNarrative}`}>{headerValue}</span>}
          </span>
        </div>
      );
    }

    const isBulletLine = trimmedLine.startsWith('- ') || trimmedLine.startsWith('• ');
    if (isBulletLine) {
      const bulletContent = trimmedLine.substring(2).trim();
      return (
        <div key={index} className="flex items-start gap-3 mb-2">
          <span className={`${accentTextNarrative} font-black mt-1 text-xl leading-none`}>
            •
          </span>
          <span className="flex-1 text-xl">{bulletContent}</span>
        </div>
      );
    }

    // Normal text lines
    return (
      <div key={index} className={trimmedLine === '' ? 'h-3' : 'mb-1 text-xl'}>
        {line}
      </div>
    );
  });
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
  }, []);

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
      console.log('API Response:', data);
      setResult(data);
    } catch (err: any) {
      console.error('Upload Error:', err);
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

  const renderLanding = () => {
    const lAccent = isDarkMode ? 'blue' : 'red';
    const lText = isDarkMode ? 'text-blue-500' : 'text-red-600';
    const lBg = isDarkMode ? 'bg-blue-600' : 'bg-red-600';
    const lBorder = isDarkMode ? 'border-blue-900/30' : 'border-red-500/30';
    const lGlow = isDarkMode ? 'shadow-[0_0_25px_rgba(59,130,246,0.5)]' : 'shadow-[0_0_25px_rgba(239,68,68,0.5)]';

    return (
    <div className="w-full flex flex-col items-center">
      {/* Hero Section */}
      <section className="min-h-screen w-full flex flex-col items-center justify-center relative px-8 grid-background">
        <div className={`absolute inset-0 bg-gradient-to-b from-transparent via-${isDarkMode ? '[#00050a]/50 to-[#00050a]' : 'white/50 to-white'} pointer-events-none`}></div>
        
        <div className="z-10 flex flex-col items-center max-w-4xl w-full">
          {/* Centered Logo */}
          <div className="mb-8 hover:scale-105 transition-transform duration-500 cursor-pointer group relative">
            <div className={`absolute inset-0 ${isDarkMode ? 'bg-blue-500/20' : 'bg-red-500/20'} blur-3xl rounded-full scale-75 group-hover:scale-110 transition-transform duration-700`}></div>
            <img 
              src={logo.src} 
              alt="Alethia Logo" 
              className={`h-72 w-auto object-contain relative z-10 mix-blend-screen ${!isDarkMode ? 'grayscale brightness-50' : ''}`} 
            />
          </div>

          {/* Site Name */}
          <h1 className={`text-7xl md:text-9xl font-sans tracking-[0.2em] font-black mb-4 glow-text text-center ${isDarkMode ? 'text-white' : 'text-red-950'}`}>
            ALETHIA
          </h1>

          {/* Subline */}
          <div className="mb-16 space-y-4 text-center">
            <p className={`text-xl md:text-2xl ${lText} font-mono tracking-[0.4em] uppercase font-black`}>Forensic Image Intelligence</p>
            <div className={`h-1 w-32 ${lBg} mx-auto glow-box`}></div>
          </div>

          {/* Upload Zone */}
<div 
            onClick={() => triggerFileUpload()}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              handleFileChange(e.dataTransfer.files?.[0] || null);
            }}
            className={`w-full max-w-2xl futuristic-panel p-2 cursor-pointer transition-all duration-500 group relative ${
              isDragging 
                ? (isDarkMode ? 'ring-2 ring-blue-400 bg-blue-900/20 shadow-[0_0_50px_rgba(59,130,246,0.3)]' : 'ring-2 ring-red-400 bg-red-900/20 shadow-[0_0_50px_rgba(239,68,68,0.3)]')
                : (isDarkMode ? 'hover:bg-blue-900/5 hover:shadow-[0_0_30px_rgba(59,130,246,0.1)]' : 'hover:bg-red-50/50')
            }`}
          >
            <div className={`flex flex-col items-center justify-center p-12 border ${lBorder} transition-colors ${isDarkMode ? 'bg-black/60' : 'bg-white'}`}>
              <div className={`p-8 ${lBg} rounded-none mb-8 ${lGlow} group-hover:scale-110 transition-all duration-500 relative overflow-hidden`}>
                <div className={`absolute inset-0 bg-white/20 -translate-y-full group-hover:translate-y-full transition-transform duration-1000 ease-in-out`}></div>
                <Upload className="h-12 w-12 text-black" strokeWidth={3} />
              </div>
              
              <span className={`text-2xl font-mono font-bold uppercase tracking-[0.25em] mb-4 text-center transition-colors ${isDarkMode ? 'text-blue-300' : 'text-red-900'}`}>
                {file ? file.name : 'Initialize Data Stream'}
              </span>
              
              <span className={`text-xs font-mono uppercase tracking-[0.4em] font-black transition-colors ${isDarkMode ? 'text-blue-700' : 'text-red-400'}`}>
                Drag & drop or click to upload source
              </span>

              {/* HUD Decorations */}
              <div className={`absolute top-4 right-4 text-[10px] font-mono ${isDarkMode ? 'text-blue-500/40' : 'text-red-500/40'} animate-pulse`}>
                [SYSTEM_READY]
              </div>
              <div className="absolute bottom-4 left-4 flex gap-4 opacity-30">
                <div className="space-y-1">
                  <div className={`h-1 w-12 ${lBg}`}></div>
                  <div className={`h-1 w-8 ${lBg}`}></div>
                </div>
                <div className={`text-[10px] font-mono ${lText}`}>SCAN_PENDING</div>
              </div>
            </div>
          </div>
          
          <div className="mt-12 animate-bounce opacity-50">
            <span className={`${lText} font-mono text-xs uppercase tracking-widest`}>Scroll to explore capabilities</span>
          </div>
        </div>
      </section>

      {/* Narrative/Explanation Section */}
      <section className={`py-32 w-full flex justify-center border-y ${isDarkMode ? 'bg-zinc-950 border-blue-900/20' : 'bg-white border-red-100'}`}>
        <div className="max-w-6xl px-8 flex flex-col md:flex-row gap-16 items-center">
          <div className="w-full md:w-1/2 space-y-8">
            <div className={`inline-block px-3 py-1 ${lBg} text-[10px] font-mono font-black text-white uppercase tracking-[0.3em]`}>
              Operational Overview
            </div>
            <h2 className={`text-5xl md:text-6xl font-sans font-black uppercase leading-[0.9] tracking-tighter ${isDarkMode ? 'text-white' : 'text-red-950'}`}>
              The Forensic <br/> 
              <span className={lText}>Standard for</span> <br/>
              Visual Truth.
            </h2>
          </div>
          <div className="w-full md:w-1/2 space-y-6">
            <p className={`text-xl font-sans leading-relaxed font-medium ${isDarkMode ? 'text-blue-200' : 'text-red-900'}`}>
              Alethia is a high-performance image forensics platform built for the age of synthetic media. 
              We empower analysts, journalists, and investigators with the tools to deconstruct digital content at a neural and cryptographic level.
            </p>
            <p className={`text-lg font-sans leading-relaxed ${isDarkMode ? 'text-blue-500/70' : 'text-red-700/70'}`}>
              By merging advanced neural artifact detection with deep metadata extraction, Alethia transforms ambiguous visual data into verified forensic intelligence. Whether detecting generated deepfakes or pinpointing geospatial origins, we provide the clarity required for high-stakes decision making.
            </p>
            <div className="pt-4 flex flex-wrap gap-x-8 gap-y-4">
              {[
                { label: 'Neural Scan', icon: <Cpu className="h-4 w-4" /> },
                { label: 'Origin Mapping', icon: <Globe className="h-4 w-4" /> },
                { label: 'Bias Indexing', icon: <PieChart className="h-4 w-4" /> }
              ].map((item, idx) => (
                <div key={idx} className={`flex items-center gap-2 text-[10px] font-mono font-black uppercase tracking-[0.2em] ${isDarkMode ? 'text-blue-300' : 'text-red-900'}`}>
                  <span className={lText}>{item.icon}</span>
                  {item.label}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Forensic Pipeline (Our Process) */}
      <section id="pipeline" className={`py-40 w-full max-w-screen-2xl px-8 border-t ${isDarkMode ? 'border-blue-900/20' : 'border-red-100'}`}>
        <div className="flex flex-col md:flex-row justify-between items-end mb-24 gap-8">
          <div className="max-w-3xl">
            <h2 className={`text-5xl md:text-7xl font-sans font-black uppercase tracking-widest mb-6 glow-text ${isDarkMode ? 'text-white' : 'text-red-950'}`}>The Forensic Pipeline</h2>
            <p className={`text-2xl font-mono uppercase tracking-wider ${lText}`}>Five stages of cryptographic and visual deconstruction.</p>
          </div>
          <div className="text-right hidden md:block">
            <p className={`text-xs font-mono mb-2 ${isDarkMode ? 'text-blue-900' : 'text-red-900'}`}>LATENCY: 420ms</p>
            <div className="flex gap-1 justify-end">
              {[...Array(12)].map((_, i) => (
                <div key={i} className={`h-4 w-1 ${lBg} ${i > 8 ? 'animate-pulse opacity-30' : ''}`}></div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 relative">
          {/* Connecting Lines (Desktop Only) */}
          <div className={`hidden md:block absolute top-[142px] left-0 w-full h-0.5 -z-10 ${isDarkMode ? 'bg-gradient-to-r from-blue-900/0 via-blue-600/50 to-blue-900/0' : 'bg-gradient-to-r from-red-900/0 via-red-600/50 to-red-900/0'}`}></div>
          
          {[
            { 
              step: "01", 
              label: "Ingestion", 
              icon: <Upload className="h-6 w-6" />,
              mock: (
                <div className={`relative h-56 w-full ${isDarkMode ? 'bg-blue-900/10 border-blue-500/20' : 'bg-red-900/5 border-red-500/20'} border overflow-hidden group-hover:border-${lAccent}-500 transition-colors flex flex-col items-center justify-center p-6`}>
                  <div className="w-full h-full bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.1)_0,transparent_70%)] absolute inset-0"></div>
                  <div className="relative z-10 flex flex-col items-center gap-6">
                    <div className={`w-20 h-20 border-2 ${isDarkMode ? 'border-blue-500' : 'border-red-500'} border-dashed animate-[spin_15s_linear_infinite] rounded-lg`}></div>
                    <div className="flex flex-col items-center gap-2">
                       <Upload className={`h-6 w-6 ${lText} animate-bounce`} />
                       <div className={`text-[10px] font-mono ${lText} tracking-tighter animate-pulse text-center uppercase`}>
                          Establishing <br/> Secure Stream
                       </div>
                    </div>
                  </div>
                  <div className={`absolute bottom-3 left-3 text-[10px] font-mono ${lText} opacity-50`}>008.23.44.12</div>
                </div>
              )
            },
            { 
              step: "02", 
              label: "Metadata", 
              icon: <Aperture className="h-6 w-6" />,
              mock: (
                <div className={`relative h-56 w-full ${isDarkMode ? 'bg-blue-900/10 border-blue-500/20' : 'bg-red-900/5 border-red-500/20'} border p-5 font-mono text-[10px] ${lText} space-y-2.5 overflow-hidden group-hover:border-${lAccent}-500 transition-colors`}>
                  {[
                    ['MAKE', 'SONY'],
                    ['MODEL', 'ILCE-7M3'],
                    ['LEN_ID', 'FE 35MM F1.8'],
                    ['ISO', '100'],
                    ['EXP', '1/125'],
                    ['GPS', '40.7128° N'],
                    ['ALT', '12.4M']
                  ].map(([key, val]) => (
                    <div key={key} className="flex justify-between border-b border-blue-500/10 pb-1">
                      <span>{key}</span>
                      <span className={isDarkMode ? 'text-white' : 'text-red-950'}>{val}</span>
                    </div>
                  ))}
                  <div className={`absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t ${isDarkMode ? 'from-black/40' : 'from-gray-100/40'} to-transparent pointer-events-none`}></div>
                </div>
              )
            },
            { 
              step: "03", 
              label: "Neural Scan", 
              icon: <Activity className="h-6 w-6" />,
              mock: (
                <div className={`relative h-56 w-full ${isDarkMode ? 'bg-blue-900/10 border-blue-500/20' : 'bg-red-900/5 border-red-500/20'} border overflow-hidden group-hover:border-${lAccent}-500 transition-colors flex flex-col justify-end p-5`}>
                   <div className={`absolute top-0 left-0 w-full h-1 ${lBg} ${isDarkMode ? 'shadow-[0_0_15px_rgba(59,130,246,1)]' : 'shadow-[0_0_15px_rgba(239,68,68,1)]'} animate-scan z-10`}></div>
                   <div className="flex flex-col h-full justify-between py-2">
                      <div className="space-y-2">
                        {[0.85, 0.4, 0.75, 0.2].map((w, i) => (
                          <div key={i} className={`h-2 w-full ${isDarkMode ? 'bg-blue-900/20' : 'bg-red-900/10'} rounded-full overflow-hidden`}>
                            <div className={`h-full ${lBg} opacity-30 animate-pulse`} style={{ width: `${w * 100}%`, animationDelay: `${i * 0.5}s` }}></div>
                          </div>
                        ))}
                      </div>
                     <div className="space-y-3">
                       <div className={`flex justify-between text-[10px] font-mono ${lText}`}>
                          <span>AI_PROBABILITY</span>
                          <span className={isDarkMode ? 'text-blue-200' : 'text-red-200'}>94.2%</span>
                       </div>
                       <div className={`h-2.5 w-full ${isDarkMode ? 'bg-blue-900/40' : 'bg-red-950/40'} rounded-full overflow-hidden`}>
                          <div className={`h-full ${lBg} w-[94%] ${lGlow}`}></div>
                       </div>
                       <div className={`text-[10px] font-mono ${lText} opacity-50 leading-tight uppercase`}>
                          GAN ARTIFACTS DETECTED <br/>
                          FFT ANOMALIES AT SCALE 0.4
                       </div>
                     </div>
                   </div>
                </div>
              )
            },
            { 
              step: "04", 
              label: "Clustering", 
              icon: <Globe className="h-6 w-6" />,
              mock: (
                <div className={`relative h-56 w-full ${isDarkMode ? 'bg-blue-900/10 border-blue-500/20' : 'bg-red-900/5 border-red-500/20'} border p-5 group-hover:border-${lAccent}-500 transition-colors flex flex-col justify-between`}>
                  <div className="flex flex-wrap gap-2.5">
                    {[...Array(12)].map((_, i) => (
                      <div key={i} className={`h-10 w-10 border ${isDarkMode ? 'border-blue-500/30' : 'border-red-500/30'} flex items-center justify-center text-[8px] font-mono ${lText} relative overflow-hidden transition-all group-hover:bg-blue-500/10`}>
                        <span className="z-10">P_{i}</span>
                        <div className={`absolute bottom-0 left-0 w-full h-1 ${lBg} opacity-30`}></div>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-2">
                    <div className={`w-full text-[11px] font-mono ${lText} uppercase tracking-tighter`}>Cross-Reference Active</div>
                    <div className="space-y-1">
                      <div className={`w-full text-[10px] font-mono ${lText} opacity-50 uppercase flex justify-between`}>
                        <span>Nodes</span>
                        <span>1.2M</span>
                      </div>
                      <div className={`w-full text-[10px] font-mono ${lText} opacity-50 uppercase flex justify-between`}>
                        <span>Coverage</span>
                        <span>98.4%</span>
                      </div>
                    </div>
                  </div>
                </div>
              )
            },
            { 
              step: "05", 
              label: "Synthesis", 
              icon: <ShieldCheck className="h-6 w-6" />,
              mock: (
                <div className={`relative h-56 w-full ${isDarkMode ? 'bg-blue-900/10 border-blue-500/20' : 'bg-red-900/5 border-red-500/20'} border p-5 flex flex-col items-center justify-center group-hover:border-${lAccent}-500 transition-colors`}>
                   <div className={`p-5 border-2 ${isDarkMode ? 'border-blue-500' : 'border-red-500'} rounded-full mb-6 shadow-[0_0_30px_rgba(59,130,246,0.3)] animate-pulse`}>
                      <Check className={`h-10 w-10 ${lText}`} />
                   </div>
                   <div className="text-center space-y-2">
                     <div className={`text-sm font-mono font-black uppercase tracking-widest ${isDarkMode ? 'text-blue-100' : 'text-red-900'}`}>Report Finalized</div>
                     <div className={`text-[10px] font-mono uppercase ${lText} opacity-70`}>ALETHIA-V4-9882</div>
                     <div className={`mt-3 px-3 py-1 border ${isDarkMode ? 'border-blue-500/40 text-blue-400' : 'border-red-500/40 text-red-600'} text-[9px] font-mono mx-auto w-fit`}>
                        VERIFIED: 2026.02.02
                     </div>
                   </div>
                </div>
              )
            }
          ].map((item, i) => (
            <div key={i} className="flex flex-col items-center group">
              <div className={`mb-4 text-sm font-mono font-black tracking-widest ${lText}`}>{item.step}</div>
              <div className="w-full mb-8">
                {item.mock}
              </div>
              <h3 className={`text-base font-mono font-black uppercase tracking-widest mb-1 transition-colors ${isDarkMode ? 'text-blue-400 group-hover:text-blue-100' : 'text-red-600 group-hover:text-red-900'}`}>{item.label}</h3>
            </div>
          ))}
        </div>
      </section>

      {/* Capabilities Section */}
      <section id="capabilities" className={`py-32 w-full px-8 border-y flex justify-center ${isDarkMode ? 'bg-zinc-950 border-blue-900/20' : 'bg-white border-red-100'}`}>
        <div className="max-w-7xl w-full">
          <div className="mb-20">
            <h2 className={`text-4xl md:text-5xl font-mono font-black uppercase tracking-[0.2em] mb-4 ${isDarkMode ? 'text-blue-900' : 'text-red-950'}`}>Forensic Capabilities</h2>
            <div className={`h-1 w-24 ${lBg}`}></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { 
                icon: <Activity className="h-10 w-10" />, 
                title: "Neural Analysis", 
                desc: "Deep-layer synthesis check for AI generation and structural deepfakes." 
              },
              { 
                icon: <Map className="h-10 w-10" />, 
                title: "Geospatial Intel", 
                desc: "Extraction of encoded GPS metadata to pinpoint digital point of origin." 
              },
              { 
                icon: <Aperture className="h-10 w-10" />, 
                title: "Exif Data", 
                desc: "Uncovering hardware signatures, lens specifications, and capture environment." 
              },
              { 
                icon: <PieChart className="h-10 w-10" />, 
                title: "Narrative Matrix", 
                desc: "Analysis of source bias and narrative context through digital source clusters." 
              }
            ].map((feat, i) => (
              <div key={i} className={`border p-8 transition-colors group relative overflow-hidden ${isDarkMode ? 'border-blue-900/30 bg-black hover:bg-blue-950/20' : 'border-red-100 bg-gray-50 hover:bg-red-50'}`}>
                <div className={`absolute top-0 left-0 w-1 h-full ${lBg}`}></div>
                <div className={`${lText} mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  {feat.icon}
                </div>
                <h3 className={`text-xl font-mono font-black uppercase tracking-wider mb-4 ${isDarkMode ? 'text-blue-300' : 'text-red-950'}`}>{feat.title}</h3>
                <p className={`font-sans leading-relaxed ${isDarkMode ? 'text-blue-500/70' : 'text-red-700/70'}`}>{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Competitive Advantage (Why Alethia) */}
      <section className="py-32 w-full max-w-6xl px-8">
        <div className="text-center mb-24">
          <h2 className={`text-4xl md:text-5xl font-mono font-black uppercase tracking-[0.2em] mb-4 glow-text ${isDarkMode ? 'text-white' : 'text-red-950'}`}>Beyond Surface Search</h2>
          <p className={`font-mono text-sm uppercase tracking-[0.3em] ${isDarkMode ? 'text-blue-500/60' : 'text-red-600/60'}`}>Alethia vs. Commercial Image Engines</p>
        </div>

        <div className={`grid grid-cols-1 md:grid-cols-3 gap-0 border rounded-none overflow-hidden futuristic-panel ${isDarkMode ? 'border-blue-900/40' : 'border-red-950/20'}`}>
          {/* Header Row */}
          <div className={`col-span-1 hidden md:block p-8 border-b md:border-r ${isDarkMode ? 'bg-blue-950/20 border-blue-900/40' : 'bg-red-950/5 border-red-500/20'}`}></div>
          <div className={`col-span-1 p-8 border-b md:border-r flex flex-col items-center justify-center ${isDarkMode ? 'bg-blue-600/10 border-blue-900/40' : 'bg-red-600/10 border-red-500/20'}`}>
            <span className={`text-2xl font-sans font-black tracking-widest ${isDarkMode ? 'text-blue-100' : 'text-red-950'}`}>ALETHIA</span>
          </div>
          <div className={`col-span-1 p-8 bg-black border-b border-blue-900/40 flex flex-col items-center justify-center opacity-60`}>
            <span className="text-xl font-mono font-bold tracking-widest text-gray-500">STANDARD SEARCH</span>
          </div>

          {[
            { 
              feature: "Image Information", 
              alethia: "Neural synthetic scan for AI/Deepfake detection.", 
              standard: "Binary match only. No integrity check.",
              icon: <ShieldCheck className="h-5 w-5" />
            },
            { 
              feature: "Metadata Depth", 
              alethia: "Cryptographic EXIF deconstruction and GPS mapping.", 
              standard: "Basic image dimensions and resolution data.",
              icon: <Aperture className="h-5 w-5" />
            },
            { 
              feature: "Image Summary", 
              alethia: "Bias matrix and cluster narrative indexing.", 
              standard: "List of visually similar images only.",
              icon: <PieChart className="h-5 w-5" />
            },
            { 
              feature: "Image Analysis", 
              alethia: "LLM-driven analysis of visual context and origins.", 
              standard: "Auto-generated tags (e.g., 'outdoor', 'mountain').",
              icon: <Activity className="h-5 w-5" />
            },
            { 
              feature: "Target Use Case", 
              alethia: "Intelligence, Law Enforcement, OSINT, Media.", 
              standard: "Consumer shopping, stock photo discovery.",
              icon: <Scan className="h-5 w-5" />
            }
          ].map((row, i) => (
            <React.Fragment key={i}>
              <div className={`p-6 md:p-8 border-b md:border-r flex items-center gap-4 ${isDarkMode ? 'bg-black/40 border-blue-900/20' : 'bg-white border-red-100'}`}>
                <div className={lText}>{row.icon}</div>
                <span className={`text-sm font-mono font-black uppercase tracking-wider ${isDarkMode ? 'text-blue-300' : 'text-red-900'}`}>{row.feature}</span>
              </div>
              <div className={`p-6 md:p-8 border-b md:border-r text-sm font-sans leading-relaxed ${isDarkMode ? 'bg-blue-950/5 border-blue-900/20 text-blue-100' : 'bg-red-50 border-red-100 text-red-950'}`}>
                <div className={`md:hidden text-[10px] font-mono mb-2 font-black uppercase ${lText}`}>Alethia Analysis:</div>
                {row.alethia}
              </div>
              <div className={`p-6 md:p-8 border-b text-sm font-sans leading-relaxed opacity-60 ${isDarkMode ? 'bg-black/60 border-blue-900/20 text-gray-400' : 'bg-gray-100 border-red-100 text-gray-600'}`}>
                <div className="md:hidden text-[10px] font-mono text-gray-600 mb-2 font-black uppercase">Standard Search:</div>
                {row.standard}
              </div>
            </React.Fragment>
          ))}
        </div>
      </section>

      {/* Mission Section */}
      <section className={`py-32 w-full border-t flex justify-center ${isDarkMode ? 'bg-[#00050a] border-blue-900/20' : 'bg-slate-50 border-red-100'}`}>
        <div className="max-w-4xl px-8 text-center space-y-12">
          <Scan className={`h-20 w-20 mx-auto animate-pulse ${lText}`} />
          <h2 className={`text-4xl font-mono font-black uppercase tracking-[0.3em] ${isDarkMode ? 'text-blue-900/40' : 'text-red-950'}`}>Veritas in Luce</h2>
          <p className={`text-xl md:text-2xl font-sans leading-relaxed font-light ${isDarkMode ? 'text-blue-300' : 'text-red-900'}`}>
            Alethia utilizes advanced forensic algorithms to strip away the layers of digital manipulation, 
            providing clarity in an era of synthetic media and deep-level disinformation.
          </p>
          <button 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className={`px-10 py-5 ${lBg} text-black font-mono font-black uppercase tracking-widest hover:opacity-90 transition-all ${isDarkMode ? 'shadow-[0_10px_30px_rgba(59,130,246,0.3)]' : 'shadow-[0_10px_30px_rgba(239,68,68,0.3)]'}`}
          >
            Start Investigation
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className={`w-full py-12 px-8 border-t text-center ${isDarkMode ? 'bg-black border-blue-900/20' : 'bg-red-950 border-red-950 shadow-[0_-10px_50px_rgba(239,68,68,0.1)]'}`}>
        <div className="flex flex-col items-center gap-6">
          <div className="flex gap-8">
            <span className={`text-xs font-mono font-black ${isDarkMode ? 'text-blue-900' : 'text-red-400'}`}>ALETHIA_V2.0.4</span>
            <span className={`text-xs font-mono font-black ${isDarkMode ? 'text-blue-900' : 'text-red-400'}`}>BUILD_ID_88419</span>
            <span className={`text-xs font-mono font-black ${isDarkMode ? 'text-blue-900' : 'text-red-400'}`}>SYSTEM_STATUS_NOMINAL</span>
          </div>
          <p className={`text-[10px] font-mono uppercase tracking-[0.5em] font-black ${isDarkMode ? 'text-blue-500/30' : 'text-red-200/50'}`}>
            © 2026 ALETHIA FORENSIC INTELLIGENCE. ALL RIGHTS RESERVED.
          </p>
        </div>
      </footer>
    </div>
    );
  };

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

    // Dynamic Accent Color for Results
    const accent = isDarkMode ? 'blue' : 'red';
    const accentText = isDarkMode ? 'text-blue-400' : 'text-red-600';
    const accentTextLight = isDarkMode ? 'text-blue-400' : 'text-red-400';
    const accentBg = isDarkMode ? 'bg-blue-600' : 'bg-red-600';
    const accentBgLight = isDarkMode ? 'bg-blue-500/20' : 'bg-red-500/10';
    const accentBorder = isDarkMode ? 'border-blue-900/40' : 'border-red-100';
    const accentRing = isDarkMode ? 'ring-blue-500/20' : 'ring-red-500/20';
    const accentShadow = isDarkMode ? 'shadow-[0_0_15px_rgba(59,130,246,0.4)]' : 'shadow-[0_0_15px_rgba(239,68,68,0.3)]';

    // Header Style Constant
    const headerStyle = `flex items-center gap-4 font-mono uppercase tracking-[0.2em] text-2xl font-black transition-colors ${
      isDarkMode 
        ? 'text-blue-400 drop-shadow-[0_0_10px_rgba(96,165,250,0.5)]' 
        : 'text-red-600 drop-shadow-[0_0_10px_rgba(239,68,68,0.3)]'
    }`;

    return (
      <div className={`w-full transition-colors duration-500 ${isDarkMode ? 'bg-black' : 'bg-white'}`}>
        <div className="max-w-[1900px] mx-auto pt-60 pb-20 px-6">
          {/* Action Row */}
          <div className="flex justify-center mb-24">
            <button
              onClick={() => triggerFileUpload()}
              className={`px-16 py-6 ${accentBg} hover:opacity-90 text-white font-black flex items-center gap-4 transition-all border-2 ${
                isDarkMode 
                  ? 'border-blue-400 shadow-[0_0_30px_rgba(59,130,246,0.3)]' 
                  : 'border-red-600 shadow-[0_0_30px_rgba(239,68,68,0.3)]'
              } font-mono uppercase tracking-[0.25em] active:scale-95 text-xl`}
            >
              <Upload className="h-8 w-8" />
              Upload New Image
            </button>
          </div>

          {/* UNIFIED FORENSIC DASHBOARD */}
          <div className={`p-8 lg:p-14 border-2 transition-all duration-500 ${
            isDarkMode 
              ? 'bg-zinc-950 border-blue-500/40 shadow-[0_0_50px_rgba(59,130,246,0.1)]' 
              : 'bg-white border-blue-200 shadow-[0_0_50px_rgba(59,130,246,0.15)]'
          }`}>
            <div className="grid grid-cols-12 gap-12 lg:gap-16 items-stretch">
              
              {/* Visual Source Data */}
              <div className="col-span-12 lg:col-span-6 flex flex-col space-y-8">
                  <div className={headerStyle}>
                      <Layers className="h-8 w-8" />
                      Visual Source Data
                  </div>
                  <div className={`p-2 flex items-center justify-center ring-1 ${accentRing} w-full h-[750px] overflow-hidden group relative transition-colors ${isDarkMode ? 'bg-black' : 'bg-slate-50'}`}>
                      <img 
                        src={imageUrl} 
                        alt="Analyzed content" 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.05]" 
                      />
                  </div>
              </div>

              {/* Integrity & Neural Breakdown */}
              <div className="col-span-12 lg:col-span-6 grid grid-cols-1 md:grid-cols-2 gap-10 h-full">
                  <section className="flex flex-col space-y-8">
                      <div className={headerStyle}>
                          <ShieldCheck className="h-8 w-8" />
                          Image Information
                      </div>
                      <div className={`p-10 flex flex-col transition-all duration-500 border h-full ${
                        isDarkMode 
                          ? 'bg-black border-blue-900/30 hover:border-blue-500/40 hover:shadow-[0_0_30px_rgba(59,130,246,0.1)]' 
                          : 'bg-white border-red-600/10 hover:border-red-300 hover:shadow-[0_0_30px_rgba(239,68,68,0.1)]'
                      }`}>
                          <dl className="flex-1 flex flex-col space-y-4 py-2">
                              <div className={`flex flex-col border-b pb-4 transition-colors ${isDarkMode ? 'border-blue-900/40' : 'border-red-600/10'}`}>
                                  <dt className={`text-sm font-black ${accentText} font-mono uppercase tracking-[0.25em] mb-1`}>Total Matches</dt>
                                  <dd className={`text-4xl font-mono font-black transition-colors ${isDarkMode ? 'text-white' : 'text-black'}`}>{total_matches || 0}</dd>
                              </div>
                              <div className={`flex flex-col border-b pb-4 transition-colors ${isDarkMode ? 'border-blue-900/40' : 'border-red-600/10'}`}>
                                  <dt className={`text-sm font-black ${accentText} font-mono uppercase tracking-[0.25em] mb-1`}>Earliest Date</dt>
                                  <dd className={`text-2xl font-mono font-bold transition-colors ${isDarkMode ? 'text-zinc-400' : 'text-black'}`}>{finalEarliestDate || "Unknown"}</dd>
                              </div>
                              <div className="flex flex-col pt-2">
                                  <dt className={`text-sm font-black ${accentText} font-mono uppercase tracking-[0.25em] mb-1`}>Image Production</dt>
                                  <dd className={`text-3xl font-mono font-black tracking-tight transition-colors ${isDarkMode ? 'text-blue-400' : 'text-red-700'}`}>{formattedVerdict}</dd>
                              </div>
                          </dl>
                      </div>
                  </section>
                  <section className="flex flex-col space-y-8">
                      <div className={headerStyle}>
                          <Activity className="h-8 w-8" />
                          AI Generated or Not
                      </div>
                      <div className={`p-10 flex flex-col transition-all duration-500 border h-full ${
                        isDarkMode 
                          ? 'bg-black border-blue-900/30 hover:border-blue-500/40 hover:shadow-[0_0_30px_rgba(59,130,246,0.1)]' 
                          : 'bg-white border-red-600/10 hover:border-red-300 hover:shadow-[0_0_30px_rgba(239,68,68,0.1)]'
                      }`}>
                          <div className="flex-1 flex flex-col space-y-6 py-2">
                            {[
                              { label: 'AI Generated', score: aiScore, color: isDarkMode ? 'bg-blue-600' : 'bg-red-600' },
                              { label: 'Human', score: humanScore, color: isDarkMode ? 'bg-blue-400' : 'bg-red-500' },
                              { label: 'Deepfake Tech', score: deepfakeScore, color: isDarkMode ? 'bg-blue-800' : 'bg-black' }
                            ].map((item) => (
                              <div key={item.label} className="w-full">
                                <div className="flex justify-between text-lg mb-2">
                                  <span className={`${accentText} font-mono uppercase tracking-widest font-black text-xs`}>{item.label}</span>
                                  <span className={`font-mono font-bold text-base transition-colors ${isDarkMode ? 'text-white' : 'text-black'}`}>{item.score.toFixed(1)}%</span>
                                </div>
                                <div className={`w-full h-3 overflow-hidden transition-colors ${isDarkMode ? 'bg-blue-950/20' : 'bg-red-600/5'}`}>
                                  <div 
                                    className={`${item.color} h-full transition-all duration-1000 ${isDarkMode ? 'shadow-[0_0_12px_rgba(59,130,246,0.5)]' : 'shadow-[0_0_12px_rgba(220,38,38,0.2)]'}`} 
                                    style={{ width: `${item.score}%` }}
                                  ></div>
                                </div>
                              </div>
                            ))}
                            <div className={`pt-4 border-t flex justify-between items-center transition-colors ${isDarkMode ? 'border-blue-900/30' : 'border-red-600/10'}`}>
                              <span className={`${accentText} font-mono uppercase text-xs font-black tracking-widest`}>Content Filter</span>
                              <span className={`font-mono text-xs px-4 py-1 border-2 font-black ${
                                nsfwDetected 
                                  ? 'text-red-600 border-red-600 bg-red-600/5' 
                                  : (isDarkMode ? 'text-blue-500 border-blue-900 bg-blue-950/20' : 'text-red-700 border-red-200 bg-white')
                                }`}>
                                {nsfwDetected ? 'RESTRICTED' : 'SECURE'}
                              </span>
                            </div>
                          </div>
                      </div>
                  </section>
              </div>

              {/* Image Analysis Cluster */}
              <div className="col-span-12 xl:col-span-7 flex flex-col space-y-8">
                  <div className={headerStyle}>
                    <Scan className="h-8 w-8" />
                    Image Analysis
                  </div>
                  <div className={`overflow-hidden border-2 transition-all duration-500 ${
                    isDarkMode 
                      ? 'bg-zinc-950 border-blue-900/40 hover:border-blue-500/50 hover:shadow-[0_0_30px_rgba(59,130,246,0.1)]' 
                      : 'bg-slate-50 border-red-100 hover:border-red-300 hover:shadow-[0_0_30px_rgba(239,68,68,0.1)]'
                  }`}>
                    <div className="grid grid-cols-1 md:grid-cols-2">
                      
                      <div className={`p-10 border-b md:border-r transition-colors ${isDarkMode ? 'border-blue-900/40' : 'border-red-100'}`}>
                          <div className={`${accentText} font-mono uppercase tracking-widest font-black text-sm mb-8 flex items-center gap-4`}>
                            <PieChart className="h-6 w-6" />
                            Narrative Bias Matrix
                          </div>
                          <div className="h-[400px] flex items-center justify-center overflow-hidden">
                            {Object.keys(biases).length > 0 ? (
                              <BiasPieChart data={biases} height={350} isDarkMode={isDarkMode} />
                            ) : (
                              <div className="flex flex-col items-center justify-center p-12 text-center h-full">
                                <PieChart className={`h-16 w-16 mb-6 opacity-20 ${isDarkMode ? 'text-blue-500' : 'text-red-500'}`} />
                                <div className={`font-mono uppercase tracking-[0.2em] text-sm font-black ${isDarkMode ? 'text-blue-900' : 'text-red-900'}`}>
                                  Narrative Data Masked
                                </div>
                                <div className={`text-xs font-mono uppercase tracking-widest mt-2 opacity-40 ${isDarkMode ? 'text-blue-500' : 'text-red-500'}`}>
                                  Refining neural signals...
                                </div>
                              </div>
                            )}
                          </div>
                      </div>

                      <div className={`p-10 border-b transition-colors ${isDarkMode ? 'border-blue-900/40' : 'border-red-100'}`}>
                          <div className={`${accentText} font-mono uppercase tracking-widest font-black text-sm mb-8 flex items-center gap-4`}>
                            <Map className="h-6 w-6" />
                            Geospatial Origin
                          </div>
                          <div className={`h-[550px] relative overflow-hidden ring-1 ${accentRing} ${isDarkMode ? 'bg-black' : 'bg-black/20'}`}>
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
                                className={`absolute inset-0 w-full h-full transition-all duration-700 ${isDarkMode ? 'opacity-80 invert grayscale brightness-75' : 'opacity-100'}`}
                              ></iframe>
                            ) : (
                              <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <Map className={`h-12 w-12 mb-5 transition-colors ${isDarkMode ? 'text-blue-900/40' : 'text-red-200'}`} />
                                <span className={`text-sm font-mono uppercase tracking-[0.2em] font-black transition-colors ${isDarkMode ? 'text-blue-900' : 'text-red-300'}`}>GPS Masked</span>
                              </div>
                            )}
                          </div>
                      </div>

                      <div className={`p-10 md:border-r transition-colors ${isDarkMode ? 'border-blue-900/40' : 'border-red-600/10'}`}>
                          <div className={`${accentText} font-mono uppercase tracking-widest font-black text-sm mb-8 flex items-center gap-4`}>
                            <Aperture className="h-6 w-6" />
                            Exif Data
                          </div>
                          <div className="space-y-8 h-[450px] overflow-y-auto custom-scrollbar pr-4">
                            {[
                              { label: 'Device', value: exif_data.Model || exif_data.Make ? `${exif_data.Make || ''} ${exif_data.Model || ''}` : null },
                              { label: 'Iris', value: exif_data['F Number'] || exif_data.Aperture },
                              { label: 'Shutter', value: exif_data.Exposure || exif_data.ExposureTime },
                              { label: 'ISO', value: exif_data.ISO }
                            ].map((spec) => (
                              <div key={spec.label} className={`flex justify-between items-center border-b pb-6 transition-colors last:border-0 ${isDarkMode ? 'border-blue-900/20' : 'border-red-600/10'}`}>
                                <span className={`text-sm ${accentText} font-mono uppercase font-black`}>{spec.label}</span>
                                <span className={`text-lg font-mono truncate max-w-[250px] transition-colors font-bold ${isDarkMode ? 'text-white' : 'text-black'}`}>{spec.value || "VOID"}</span>
                              </div>
                            ))}
                          </div>
                      </div>

                      <div className="p-10 flex flex-col">
                          <div className={`${accentText} font-mono uppercase tracking-widest font-black text-sm mb-8 flex items-center gap-4`}>
                            <Search className="h-6 w-6" />
                            Matching Image URLs
                          </div>
                          <div className={`h-[550px] overflow-y-auto custom-scrollbar pr-4 ring-1 ${accentRing} p-6 relative transition-colors ${isDarkMode ? 'bg-black/40' : 'bg-red-600/5'}`}>
                             <SourceList data={source_clusters} isDarkMode={isDarkMode} accentColor={isDarkMode ? 'blue' : 'red'} />
                          </div>
                      </div>

                    </div>
                  </div>
              </div>

              {/* Visual Narrative Analysis */}
              <div className="col-span-12 xl:col-span-5 flex flex-col space-y-8">
                  <div className={headerStyle}>
                      <Scan className="h-8 w-8" />
                      Image Summary
                  </div>
                  <div className={`p-12 flex flex-col relative box-border transition-all duration-500 h-full border ${
                    isDarkMode 
                      ? 'bg-black border-blue-900/40 shadow-[0_0_50px_rgba(59,130,246,0.05)] hover:border-blue-500/50 hover:shadow-[0_0_40px_rgba(59,130,246,0.1)]' 
                      : 'bg-white border-red-50 shadow-xl hover:border-red-300 hover:shadow-[0_0_40px_rgba(239,68,68,0.15)]'
                  }`}>
                      <div className="flex-1 overflow-y-auto custom-scrollbar pr-8">
                        <div className={`text-2xl leading-[1.8] font-sans transition-colors ${isDarkMode ? 'text-zinc-300' : 'text-slate-800'} ${!isDescriptionExpanded ? 'line-clamp-[25]' : ''}`}>
                            <span className={`${accentText} font-mono font-bold mr-4 text-3xl`}>[ID-001]</span>
                            {image_description 
                              ? renderNarrativeAnalysis(image_description, isDarkMode)
                              : "Processing visual data nodes... Extracting narrative metadata."
                            }
                        </div>
                      </div>
                          <div className={`mt-8 pt-8 flex justify-center items-center bg-transparent border-t-2 transition-colors ${isDarkMode ? 'border-blue-900/40' : 'border-red-600/10'}`}>
                          <button 
                            onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                            className={`${accentText} hover:opacity-80 text-base font-mono font-black uppercase tracking-widest flex items-center gap-4 transition-colors focus:outline-none`}
                          >
                            {isDescriptionExpanded ? '[ CLOSE REPORT ]' : '[ READ FULL REPORT ]'}
                          </button>
                      </div>
                  </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <main className={`min-h-screen transition-colors duration-500 overflow-x-hidden ${isDarkMode ? 'dark-theme' : 'light-theme'} ${isDarkMode ? 'bg-[#00050a] text-blue-400' : 'bg-slate-50 text-slate-800'}`}>
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
      />
      {/* TopBar only shown in results mode */}
      {result && (
        <div className={`transition-all duration-500 ${showTopBar ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-full pointer-events-none'}`}>
          <TopBar 
            isDarkMode={isDarkMode} 
            onThemeToggle={() => setIsDarkMode(!isDarkMode)} 
            onReset={handleReset}
            showLogo={true}
          />
        </div>
      )}

      {/* Floating Side Icons for Landing Page */}
      {!result && !isLoading && (
        <div className="fixed right-10 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-6">
          <button 
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={`p-4 rounded-full shadow-2xl transition-all duration-300 group hover:scale-110 border ${isDarkMode ? 'bg-black/60 border-blue-900/50 text-blue-400 hover:bg-blue-900/30 shadow-blue-500/10' : 'bg-white border-red-100 text-red-600 hover:bg-red-50 shadow-red-500/10'}`}
            title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {isDarkMode ? <Sun className="h-6 w-6" /> : <Moon className="h-6 w-6" />}
          </button>
          
          <button 
            onClick={() => triggerFileUpload()}
            className={`p-4 rounded-full shadow-2xl transition-all duration-300 group hover:scale-110 border ${isDarkMode ? 'bg-black/60 border-blue-900/50 text-blue-400 hover:bg-blue-900/30' : 'bg-white border-red-100 text-red-600 hover:bg-red-50'}`}
            title="Start New Investigation"
          >
            <Upload className="h-6 w-6" />
          </button>

          <button 
            onClick={() => document.getElementById('pipeline')?.scrollIntoView({ behavior: 'smooth' })}
            className={`p-4 rounded-full shadow-2xl transition-all duration-300 group hover:scale-110 border ${isDarkMode ? 'bg-black/60 border-blue-900/50 text-blue-400 hover:bg-blue-900/30' : 'bg-white border-red-100 text-red-600 hover:bg-red-50'}`}
            title="View Forensic Pipeline"
          >
            <Layers className="h-6 w-6" />
          </button>

          <button 
            onClick={() => document.getElementById('capabilities')?.scrollIntoView({ behavior: 'smooth' })}
            className={`p-4 rounded-full shadow-2xl transition-all duration-300 group hover:scale-110 border ${isDarkMode ? 'bg-black/60 border-blue-900/50 text-blue-400 hover:bg-blue-900/30' : 'bg-white border-red-100 text-red-600 hover:bg-red-50'}`}
            title="Forensic Capabilities"
          >
            <Activity className="h-6 w-6" />
          </button>
        </div>
      )}
      
      {!result && !isLoading && renderLanding()}

      {isLoading && (
        <div className="pt-24">
          <SkeletonLoader isDarkMode={isDarkMode} />
        </div>
      )}
      
      {result && !isLoading && renderResults()}
      
      {error && <div className="mt-4 text-red-500 px-8 text-center text-sm font-mono uppercase tracking-widest">Error: {error}</div>}
    </main>
  );
}
