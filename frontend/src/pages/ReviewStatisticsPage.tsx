import { useEffect, useState, useMemo } from "react";
import { collection, query, where, orderBy, onSnapshot } from "firebase/firestore";
import { useAuth } from "../firebaseHelpers/AuthContext";
import { db } from "../firebaseConfig";
import { BarChart3, Calendar, Star as StarIcon, MessageCircle, TrendingUp } from "lucide-react";
import { useSubscription } from "../firebaseHelpers/useSubscription";

type RangeOption = "Last 7 days" | "Last 30 days" | "Quarter to date" | "Show all reviews";

type RawReview = {
  docId: string;
  rating: number;
  createdAt?: Date;
};

const rangeOptions: RangeOption[] = ["Last 7 days", "Last 30 days", "Quarter to date", "Show all reviews"];

const getTimePeriodLabel = (range: RangeOption): string => {
  switch (range) {
    case "Last 7 days":
      return "last 7 days";
    case "Last 30 days":
      return "last 30 days";
    case "Quarter to date":
      return "quarter to date";
    case "Show all reviews":
      return "all time";
  }
};

const getDateRangeFilter = (range: RangeOption): Date | null => {
  if (range === "Show all reviews") return null;

  const now = new Date();
  const result = new Date();

  switch (range) {
    case "Last 7 days":
      result.setDate(now.getDate() - 7);
      break;
    case "Last 30 days":
      result.setDate(now.getDate() - 30);
      break;
    case "Quarter to date":
      const currentMonth = now.getMonth();
      const quarterStartMonth = Math.floor(currentMonth / 3) * 3;
      result.setMonth(quarterStartMonth);
      result.setDate(1);
      result.setHours(0, 0, 0, 0);
      break;
  }

  return result;
};

const renderStars = (rating: number) => {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, index) => {
        const isFilled = index < Math.floor(rating);
        return (
          <StarIcon
            key={index}
            className={isFilled ? "h-4 w-4 text-yellow-400 fill-yellow-400" : "h-4 w-4 text-gray-300"}
            fill={isFilled ? "currentColor" : "none"}
          />
        );
      })}
    </div>
  );
};

export default function ReviewStatisticsPage() {
  const { businessId } = useAuth();
  const { isPro } = useSubscription();
  const [rawReviews, setRawReviews] = useState<RawReview[]>([]);
  const [selectedRange, setSelectedRange] = useState<RangeOption>("Last 7 days");
  const [isRangeMenuOpen, setIsRangeMenuOpen] = useState(false);
  const [ratingTooltip, setRatingTooltip] = useState<{ x: number; y: number; label: string; value: string } | null>(null);
  const [volumeTooltip, setVolumeTooltip] = useState<{ x: number; y: number; label: string; value: string } | null>(null);

  // Free tier: restrict to 7-day range only
  const freeRangeOptions: RangeOption[] = ["Last 7 days"];
  const effectiveRangeOptions = isPro ? rangeOptions : freeRangeOptions;

  const handleCycleRange = () => {
    const currentIndex = effectiveRangeOptions.indexOf(selectedRange);
    const nextIndex = (currentIndex + 1) % effectiveRangeOptions.length;
    setSelectedRange(effectiveRangeOptions[nextIndex]);
    setIsRangeMenuOpen(false);
  };

  const handleSelectRange = (option: RangeOption) => {
    if (!isPro && option !== "Last 7 days") return;
    setSelectedRange(option);
    setIsRangeMenuOpen(false);
  };

  useEffect(() => {
    if (!businessId) return;
    const q = query(
      collection(db, "feedback"),
      where("businessId", "==", businessId),
      orderBy("createdAt", "desc")
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const filterDate = getDateRangeFilter(selectedRange);
      const fetched: RawReview[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        const createdAt = data.createdAt?.toDate();
        
        // Filter by date range (null filterDate means show all)
        if (filterDate && createdAt && createdAt < filterDate) return;

        fetched.push({
          docId: docSnap.id,
          rating: data.rating || 0,
          createdAt,
        });
      });
      setRawReviews(fetched);
    });
    return () => unsubscribe();
  }, [businessId, selectedRange]);

  const stats = useMemo(() => {
    const total = rawReviews.length;
    const sum = rawReviews.reduce((acc, r) => acc + r.rating, 0);
    const avgRating = total > 0 ? Math.round((sum / total) * 10) / 10 : 0;

    // Rating distribution
    const distribution = [1, 2, 3, 4, 5].map((star) => ({
      star,
      count: rawReviews.filter((r) => Math.round(r.rating) === star).length,
    }));

    return { total, avgRating, distribution };
  }, [rawReviews]);

  // Generate time-series data for graphs
  const chartData = useMemo(() => {
    if (rawReviews.length === 0) return { labels: [], avgRatings: [], totalReviews: [] };

    const filterDate = getDateRangeFilter(selectedRange);
    const now = new Date();
    const startDate = filterDate || new Date(Math.min(...rawReviews.map(r => r.createdAt?.getTime() || Date.now())));
    
    // Determine number of data points based on range
    let numPoints = 7;
    if (selectedRange === "Last 30 days") numPoints = 10;
    else if (selectedRange === "Quarter to date") numPoints = 12;
    else if (selectedRange === "Show all reviews") numPoints = 12;

    const timeSpan = now.getTime() - startDate.getTime();
    const interval = timeSpan / numPoints;

    const labels: string[] = [];
    const avgRatings: number[] = [];
    const totalReviews: number[] = [];

    for (let i = 0; i <= numPoints; i++) {
      const pointTime = new Date(startDate.getTime() + interval * i);
      const nextPointTime = new Date(startDate.getTime() + interval * (i + 1));
      
      // Filter reviews in this time bucket
      const reviewsInBucket = rawReviews.filter(r => {
        if (!r.createdAt) return false;
        return r.createdAt >= pointTime && r.createdAt < nextPointTime;
      });

      // Calculate average rating for this bucket
      const bucketTotal = reviewsInBucket.length;
      const bucketSum = reviewsInBucket.reduce((acc, r) => acc + r.rating, 0);
      const bucketAvg = bucketTotal > 0 ? bucketSum / bucketTotal : 0;

      labels.push(pointTime.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
      avgRatings.push(bucketAvg);
      totalReviews.push(bucketTotal);
    }

    return { labels, avgRatings, totalReviews };
  }, [rawReviews, selectedRange]);

  const maxDistribution = Math.max(...stats.distribution.map((d) => d.count), 1);

  return (
    <div className="w-full flex flex-col overflow-y-auto" style={{ height: "calc(100vh - 220px)" }}>
      <div className="shrink-0 px-6 pt-6 pb-4">
        <section className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Review Statistics</h1>
            <p className="text-base text-gray-600">Overall performance metrics and insights</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <button
                type="button"
                onClick={() => (isRangeMenuOpen ? handleCycleRange() : setIsRangeMenuOpen(true))}
                className={`flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
                  isRangeMenuOpen
                    ? "bg-linear-to-r from-[#F2C125] to-[#FF8C1A] text-white hover:opacity-95"
                    : "bg-white text-black border border-gray-200 hover:bg-gray-50"
                }`}
              >
                <Calendar className="h-4 w-4" />
                {selectedRange}
              </button>
              {isRangeMenuOpen && (
                <div className="absolute right-0 top-full z-10 mt-2 w-48 rounded-xl border border-gray-200 bg-white p-2 shadow-lg">
                  <p className="px-2 pb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
                    Choose range
                  </p>
                  <ul className="space-y-1">
                    {rangeOptions.map((option) => {
                      const locked = !isPro && option !== "Last 7 days";
                      return (
                        <li key={option}>
                          <button
                            type="button"
                            onClick={() => handleSelectRange(option)}
                            disabled={locked}
                            className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm ${
                              option === selectedRange
                                ? "bg-gray-900 text-white"
                                : locked
                                ? "text-gray-400 cursor-not-allowed"
                                : "text-gray-700 hover:bg-linear-to-r hover:from-[#F2C125] hover:to-[#FF8C1A] hover:text-white"
                            } transition-colors`}
                          >
                            {option}
                            {locked && <span className="text-xs">Pro</span>}
                            {option === selectedRange && <span className="text-xs font-medium">Active</span>}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>

      <div className="shrink-0 px-6 pb-4 space-y-4">
        {/* Summary Stats */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center justify-between rounded-xl bg-white p-4 shadow-sm">
            <div className="space-y-2">
              <p className="text-sm font-semibold uppercase tracking-wide text-gray-500">
                {selectedRange === "Show all reviews" ? "Total Reviews" : `Total Reviews in the ${getTimePeriodLabel(selectedRange)}`}
              </p>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-gray-900">{stats.total}</span>
              </div>
            </div>
            <div className="grid h-12 w-12 place-items-center rounded-full bg-gray-50">
              <MessageCircle className="h-6 w-6 text-blue-500" />
            </div>
          </div>

          <div className="flex items-center justify-between rounded-xl bg-white p-4 shadow-sm">
            <div className="space-y-2">
              <p className="text-sm font-semibold uppercase tracking-wide text-gray-500">Average Rating</p>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-gray-900">{stats.avgRating.toFixed(1)}</span>
                {renderStars(stats.avgRating)}
              </div>
            </div>
            <div className="grid h-12 w-12 place-items-center rounded-full bg-gray-50">
              <StarIcon className="h-6 w-6 text-yellow-400" />
            </div>
          </div>
        </section>

        {/* Graphs Section */}
        {rawReviews.length > 0 && (
          <section className="space-y-4">
            {/* Average Rating Over Time */}
            <div className="rounded-xl bg-white p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="h-5 w-5 text-yellow-500" />
                <h3 className="text-sm font-semibold text-gray-900">Average Rating Over Time</h3>
              </div>
              <div className="relative h-32">
                <svg 
                  className="w-full h-full" 
                  viewBox="0 0 450 110" 
                  preserveAspectRatio="none"
                  onMouseLeave={() => setRatingTooltip(null)}
                  onMouseMove={(e) => {
                    const svg = e.currentTarget;
                    const rect = svg.getBoundingClientRect();
                    const mouseX = ((e.clientX - rect.left) / rect.width) * 450;
                    
                    if (mouseX < 35 || mouseX > 440) {
                      setRatingTooltip(null);
                      return;
                    }
                    
                    // Find closest data point
                    const relativeX = (mouseX - 35) / 405;
                    const index = Math.round(relativeX * (chartData.avgRatings.length - 1));
                    const clampedIndex = Math.max(0, Math.min(chartData.avgRatings.length - 1, index));
                    
                    const rating = chartData.avgRatings[clampedIndex];
                    const dataX = 35 + (clampedIndex / (chartData.avgRatings.length - 1)) * 405;
                    const dataY = 5 + (100 - (rating / 5) * 100);
                    
                    setRatingTooltip({
                      x: rect.left + (dataX / 450) * rect.width,
                      y: rect.top + (dataY / 110) * rect.height,
                      label: chartData.labels[clampedIndex],
                      value: rating.toFixed(2)
                    });
                  }}
                >
                  {/* Grid lines and y-axis labels */}
                  {[0, 1, 2, 3, 4, 5].map((i) => (
                    <g key={i}>
                      <line
                        x1="35"
                        y1={5 + (100 - (i * 20))}
                        x2="440"
                        y2={5 + (100 - (i * 20))}
                        stroke="#e5e7eb"
                        strokeWidth="0.5"
                      />
                      <text
                        x="5"
                        y={5 + (100 - (i * 20)) + 3}
                        fontSize="10"
                        fill="#9ca3af"
                        textAnchor="start"
                      >
                        {i}
                      </text>
                    </g>
                  ))}
                  {/* Line chart */}
                  <polyline
                    points={chartData.avgRatings.map((rating, i) => {
                      const x = 35 + (i / (chartData.avgRatings.length - 1)) * 405;
                      const y = 5 + (100 - (rating / 5) * 100);
                      return `${x},${y}`;
                    }).join(' ')}
                    fill="none"
                    stroke="#f59e0b"
                    strokeWidth="2"
                    style={{ pointerEvents: 'none' }}
                  />
                  {/* Data points */}
                  {chartData.avgRatings.map((rating, i) => {
                    const x = 35 + (i / (chartData.avgRatings.length - 1)) * 405;
                    const y = 5 + (100 - (rating / 5) * 100);
                    return (
                      <circle
                        key={i}
                        cx={x}
                        cy={y}
                        r="3"
                        fill="#f59e0b"
                        style={{ pointerEvents: 'none' }}
                      />
                    );
                  })}
                </svg>
                {ratingTooltip && (
                  <div
                    className="fixed z-50 bg-gray-900 text-white text-xs rounded px-2 py-1 pointer-events-none"
                    style={{
                      left: `${ratingTooltip.x}px`,
                      top: `${ratingTooltip.y - 40}px`,
                      transform: 'translateX(-50%)'
                    }}
                  >
                    <div className="font-semibold">{ratingTooltip.label}</div>
                    <div>Rating: {ratingTooltip.value} ⭐</div>
                  </div>
                )}
              </div>
              <div className="flex justify-between mt-2 text-xs text-gray-500 pl-8">
                <span>{chartData.labels[0]}</span>
                <span>{chartData.labels[Math.floor(chartData.labels.length / 2)]}</span>
                <span>{chartData.labels[chartData.labels.length - 1]}</span>
              </div>
            </div>

            {/* Total Reviews Over Time */}
            <div className="rounded-xl bg-white p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <MessageCircle className="h-5 w-5 text-blue-500" />
                <h3 className="text-sm font-semibold text-gray-900">Review Volume Over Time</h3>
              </div>
              <div className="relative h-32">
                <svg 
                  className="w-full h-full" 
                  viewBox="0 0 450 110" 
                  preserveAspectRatio="none"
                  onMouseLeave={() => setVolumeTooltip(null)}
                >
                  {/* Grid lines and y-axis labels */}
                  {(() => {
                    const maxCount = Math.max(...chartData.totalReviews, 1);
                    const step = Math.ceil(maxCount / 4);
                    return [0, 1, 2, 3, 4].map((i) => {
                      const value = i * step;
                      return (
                        <g key={i}>
                          <line
                            x1="35"
                            y1={5 + (100 - (i * 25))}
                            x2="440"
                            y2={5 + (100 - (i * 25))}
                            stroke="#e5e7eb"
                            strokeWidth="0.5"
                          />
                          <text
                            x="5"
                            y={5 + (100 - (i * 25)) + 3}
                            fontSize="10"
                            fill="#9ca3af"
                            textAnchor="start"
                          >
                            {value}
                          </text>
                        </g>
                      );
                    });
                  })()}
                  {/* Bar chart */}
                  {chartData.totalReviews.map((count, i) => {
                    const maxCount = Math.max(...chartData.totalReviews, 1);
                    const barWidth = 405 / chartData.totalReviews.length * 0.8;
                    const x = 35 + (i / chartData.totalReviews.length) * 405 + (405 / chartData.totalReviews.length) * 0.1;
                    const height = (count / maxCount) * 100;
                    const y = 5 + (100 - height);
                    return (
                      <rect
                        key={i}
                        x={x}
                        y={y}
                        width={barWidth}
                        height={height}
                        fill="#3b82f6"
                        opacity="0.8"
                        style={{ cursor: 'pointer' }}
                        onMouseEnter={(e) => {
                          const rect = e.currentTarget.ownerSVGElement?.getBoundingClientRect();
                          if (rect) {
                            setVolumeTooltip({
                              x: rect.left + ((x + barWidth / 2) / 450) * rect.width,
                              y: rect.top + (y / 110) * rect.height,
                              label: chartData.labels[i],
                              value: count.toString()
                            });
                          }
                        }}
                      />
                    );
                  })}
                </svg>
                {volumeTooltip && (
                  <div
                    className="fixed z-50 bg-gray-900 text-white text-xs rounded px-2 py-1 pointer-events-none"
                    style={{
                      left: `${volumeTooltip.x}px`,
                      top: `${volumeTooltip.y - 40}px`,
                      transform: 'translateX(-50%)'
                    }}
                  >
                    <div className="font-semibold">{volumeTooltip.label}</div>
                    <div>Reviews: {volumeTooltip.value}</div>
                  </div>
                )}
              </div>
              <div className="flex justify-between mt-2 text-xs text-gray-500 pl-8">
                <span>{chartData.labels[0]}</span>
                <span>{chartData.labels[Math.floor(chartData.labels.length / 2)]}</span>
                <span>{chartData.labels[chartData.labels.length - 1]}</span>
              </div>
            </div>
          </section>
        )}

        {/* Rating Distribution */}
        <section className="rounded-xl bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="h-5 w-5 text-gray-700" />
            <h3 className="text-sm font-semibold text-gray-900">Rating Distribution</h3>
          </div>
          <div className="space-y-3">
            {stats.distribution.reverse().map((item) => (
              <div key={item.star} className="flex items-center gap-3">
                <div className="flex items-center gap-1 w-16">
                  <span className="text-sm font-medium text-gray-700">{item.star}</span>
                  <StarIcon className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                </div>
                <div className="flex-1 bg-gray-100 rounded-full h-6 relative overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-[#F2C125] to-[#FF8C1A] h-full rounded-full transition-all duration-300"
                    style={{ width: `${(item.count / maxDistribution) * 100}%` }}
                  />
                </div>
                <span className="text-sm font-semibold text-gray-700 w-12 text-right">{item.count}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
