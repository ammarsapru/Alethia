import React from 'react';

const SkeletonLoader = ({ isDarkMode = true }: { isDarkMode?: boolean }) => {
  return (
    <div className={`w-full max-w-[1600px] mx-auto space-y-20 pb-20 animate-pulse transition-colors ${isDarkMode ? '' : 'opacity-70'}`}>
      {/* Partition 1: Hero Skeleton */}
      <section className="min-h-[calc(100vh-120px)] flex flex-col items-center justify-center space-y-12 py-10">
        {/* Upload Button Placeholder */}
        <div className={`h-16 w-64 border transition-colors ${isDarkMode ? 'bg-blue-900/20 border-blue-900/40' : 'bg-blue-100 border-blue-200'}`}></div>

        {/* 1:1 Split Hero Placeholder */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start w-full px-4 max-w-[1400px]">
          {/* Image Box Placeholder */}
          <div className="w-full space-y-4">
            <div className={`h-4 w-32 transition-colors ${isDarkMode ? 'bg-blue-900/20' : 'bg-blue-100'}`}></div>
            <div className={`h-[500px] w-full border transition-colors ${isDarkMode ? 'bg-blue-900/10 border-blue-900/30' : 'bg-white border-blue-200'}`}></div>
          </div>
          {/* Description Box Placeholder */}
          <div className="w-full space-y-4">
            <div className={`h-4 w-40 transition-colors ${isDarkMode ? 'bg-blue-900/20' : 'bg-blue-100'}`}></div>
            <div className={`h-[500px] w-full border p-8 space-y-4 transition-colors ${isDarkMode ? 'bg-blue-900/10 border-blue-900/30' : 'bg-white border-blue-200'}`}>
              <div className={`h-8 w-24 transition-colors ${isDarkMode ? 'bg-blue-900/20' : 'bg-blue-100'}`}></div>
              <div className={`h-4 w-full transition-colors ${isDarkMode ? 'bg-blue-900/20' : 'bg-blue-100'}`}></div>
              <div className={`h-4 w-full transition-colors ${isDarkMode ? 'bg-blue-900/20' : 'bg-blue-100'}`}></div>
              <div className={`h-4 w-3/4 transition-colors ${isDarkMode ? 'bg-blue-900/20' : 'bg-blue-100'}`}></div>
            </div>
          </div>
        </div>
      </section>

      {/* Partition 2: Data Breakdown Skeleton */}
      <section className="min-h-screen py-20 px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-10">
              <div className="space-y-4">
                <div className={`h-4 w-40 transition-colors ${isDarkMode ? 'bg-blue-900/20' : 'bg-blue-100'}`}></div>
                <div className={`h-80 w-full border transition-colors ${isDarkMode ? 'bg-blue-900/10 border-blue-900/30' : 'bg-white border-blue-200'}`}></div>
              </div>
              <div className="space-y-4">
                <div className={`h-4 w-40 transition-colors ${isDarkMode ? 'bg-blue-900/20' : 'bg-blue-100'}`}></div>
                <div className={`h-96 w-full border transition-colors ${isDarkMode ? 'bg-blue-900/10 border-blue-900/30' : 'bg-white border-blue-200'}`}></div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default SkeletonLoader;
