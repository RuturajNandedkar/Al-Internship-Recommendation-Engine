/**
 * SkeletonCard — animated shimmer placeholder that mirrors RecommendationCard layout.
 * Shown while recommendations are loading (replaces the old spinner).
 */
export default function SkeletonCard() {
  return (
    <div className="rec-card bg-white rounded-3xl overflow-hidden">
      <div className="p-6 sm:p-7">
        <div className="flex items-start gap-5">
          {/* Ring placeholder */}
          <div className="hidden sm:block flex-shrink-0">
            <div className="w-[84px] h-[84px] rounded-full bg-gray-200 animate-pulse" />
          </div>

          {/* Text placeholders */}
          <div className="flex-1 min-w-0 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-6 rounded-xl bg-gray-200 animate-pulse" />
              <div className="h-5 w-48 rounded-lg bg-gray-200 animate-pulse" />
            </div>
            <div className="h-4 w-36 rounded-lg bg-gray-100 animate-pulse" />

            {/* Tag placeholders */}
            <div className="flex flex-wrap gap-2 mt-3">
              <div className="h-7 w-24 rounded-xl bg-gray-100 animate-pulse" />
              <div className="h-7 w-20 rounded-xl bg-gray-100 animate-pulse" />
              <div className="h-7 w-28 rounded-xl bg-gray-100 animate-pulse" />
              <div className="h-7 w-20 rounded-xl bg-gray-100 animate-pulse" />
            </div>
          </div>

          {/* Mobile ring placeholder */}
          <div className="sm:hidden flex-shrink-0">
            <div className="w-[68px] h-[68px] rounded-full bg-gray-200 animate-pulse" />
          </div>
        </div>

        {/* Skills row placeholder */}
        <div className="mt-5 pt-5 border-t border-gray-100/80">
          <div className="h-3 w-24 rounded bg-gray-100 animate-pulse mb-2.5" />
          <div className="flex flex-wrap gap-2">
            {[60, 80, 55, 70, 50].map((w) => (
              <div
                key={w}
                className="h-6 rounded-lg bg-gray-100 animate-pulse"
                style={{ width: `${w}px` }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* AI explanation placeholder */}
      <div className="px-6 sm:px-7 pb-3">
        <div className="h-4 w-3/4 rounded bg-gray-100 animate-pulse mb-2" />
        <div className="h-4 w-1/2 rounded bg-gray-100 animate-pulse" />
      </div>

      {/* Expand button placeholder */}
      <div className="px-6 sm:px-7 py-5">
        <div className="h-10 w-36 mx-auto rounded-2xl bg-gray-100 animate-pulse" />
      </div>
    </div>
  );
}
