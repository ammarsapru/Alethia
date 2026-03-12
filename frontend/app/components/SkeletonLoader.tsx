import React from 'react';

const SkeletonLoader = ({ isDarkMode = true }: { isDarkMode?: boolean }) => {
  return (
    <div className={`w-full max-w-[1900px] mx-auto space-y-20 pb-20 animate-pulse transition-colors`}>
      {/* Partition 1: Hero Skeleton */}
      <section className="min-h-[calc(100vh-120px)] flex flex-col items-center justify-center space-y-12 py-10">
        {/* Upload Button Placeholder */}
        <div className={`h-16 w-64 border-2 transition-colors ${isDarkMode ? 'bg-blue-900/20 border-blue-400/30' : 'bg-red-500/10 border-red-500/30'}`}></div>

        {/* 1:1 Split Hero Placeholder */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start w-full px-4 max-w-[1700px]">
          {/* Image Box Placeholder */}
          <div className="w-full space-y-6">
            <div className={`h-6 w-48 transition-colors ${isDarkMode ? 'bg-blue-900/20' : 'bg-red-500/10'}`}></div>
            <div className={`h-[700px] w-full border-2 transition-colors ${isDarkMode ? 'bg-blue-900/10 border-blue-900/40' : 'bg-white border-red-100'}`}></div>
          </div>
          {/* Description Box Placeholder */}
          <div className="w-full space-y-6">
            <div className={`h-6 w-56 transition-colors ${isDarkMode ? 'bg-blue-900/20' : 'bg-red-500/10'}`}></div>
            <div className={`h-[700px] w-full border-2 p-10 space-y-6 transition-colors ${isDarkMode ? 'bg-blue-900/10 border-blue-900/40' : 'bg-white border-red-100'}`}>
              <div className={`h-10 w-32 transition-colors ${isDarkMode ? 'bg-blue-900/20' : 'bg-red-500/20'}`}></div>
              <div className={`h-5 w-full transition-colors ${isDarkMode ? 'bg-blue-900/20' : 'bg-red-500/10'}`}></div>
              <div className={`h-5 w-full transition-colors ${isDarkMode ? 'bg-blue-900/20' : 'bg-red-500/10'}`}></div>
              <div className={`h-5 w-3/4 transition-colors ${isDarkMode ? 'bg-blue-900/20' : 'bg-red-500/10'}`}></div>
              <div className={`h-5 w-full transition-colors ${isDarkMode ? 'bg-blue-900/20' : 'bg-red-500/10'}`}></div>
              <div className={`h-5 w-5/6 transition-colors ${isDarkMode ? 'bg-blue-900/20' : 'bg-red-500/10'}`}></div>
            </div>
          </div>
        </div>
      </section>

      {/* Partition 2: Data Breakdown Skeleton */}
      <section className="min-h-screen py-20 px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-12">
              <div className="space-y-6">
                <div className={`h-6 w-48 transition-colors ${isDarkMode ? 'bg-blue-900/20' : 'bg-red-500/10'}`}></div>
                <div className={`h-[500px] w-full border-2 transition-colors ${isDarkMode ? 'bg-blue-900/10 border-blue-900/40' : 'bg-white border-red-100 shadow-sm'}`}></div>
              </div>
              <div className="space-y-6">
                <div className={`h-6 w-56 transition-colors ${isDarkMode ? 'bg-blue-900/20' : 'bg-red-500/10'}`}></div>
                <div className={`h-[600px] w-full border-2 transition-colors ${isDarkMode ? 'bg-blue-900/10 border-blue-900/40' : 'bg-white border-red-100 shadow-sm'}`}></div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default SkeletonLoader;
