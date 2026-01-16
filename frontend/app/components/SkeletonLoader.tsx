import React from 'react';

const SkeletonCard = () => (
  <div className="bg-card-bg border border-card-border rounded-lg shadow-md">
    <div className="p-4 border-b border-card-border">
      <div className="h-6 bg-gray-700 rounded w-1/3 animate-pulse"></div>
    </div>
    <div className="p-4 space-y-4">
      <div className="h-4 bg-gray-700 rounded w-full animate-pulse"></div>
      <div className="h-4 bg-gray-700 rounded w-5/6 animate-pulse"></div>
      <div className="h-4 bg-gray-700 rounded w-3/4 animate-pulse"></div>
    </div>
  </div>
);

const SkeletonLoader = () => {
  return (
    <div className="w-full max-w-7xl mx-auto p-4 md:p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Main Content Skeleton */}
      <div className="lg:col-span-2 space-y-8">
        <div className="bg-card-bg border border-card-border rounded-lg shadow-md p-4">
          <div className="h-96 bg-gray-700 rounded-md animate-pulse"></div>
        </div>
        <SkeletonCard />
      </div>
      {/* Sidebar Skeleton */}
      <div className="space-y-8">
        <SkeletonCard />
        <SkeletonCard />
      </div>
    </div>
  );
};

export default SkeletonLoader;
