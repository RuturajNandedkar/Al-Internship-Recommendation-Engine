import React from 'react';

export const SkeletonCard = () => {
  return (
    <div className="card-premium p-6 sm:p-8 space-y-6 shimmer-wrapper relative">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-surface2 animate-pulse" />
          <div className="space-y-2">
            <div className="h-4 w-32 bg-surface2 rounded animate-pulse" />
            <div className="h-3 w-24 bg-surface2 rounded animate-pulse" />
          </div>
        </div>
        <div className="w-14 h-14 rounded-full bg-surface2 animate-pulse" />
      </div>

      <div className="space-y-3">
        <div className="h-3 w-full bg-surface2 rounded animate-pulse" />
        <div className="h-3 w-5/6 bg-surface2 rounded animate-pulse" />
      </div>

      <div className="flex flex-wrap gap-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-6 w-16 bg-surface2 rounded-full animate-pulse" />
        ))}
      </div>

      <div className="pt-4 border-t border-white/5 flex justify-between items-center">
        <div className="h-4 w-20 bg-surface2 rounded animate-pulse" />
        <div className="h-9 w-24 bg-surface2 rounded-xl animate-pulse" />
      </div>
    </div>
  );
};

export const SkeletonList = ({ count = 3 }: { count?: number }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
};
