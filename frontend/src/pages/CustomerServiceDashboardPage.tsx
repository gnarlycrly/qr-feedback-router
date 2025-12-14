// Dashboard for customer service teams — shows quick stats, recent reviews and action items.
import { useEffect, useState } from "react";
import {
  AlertTriangle,
  Calendar,
  MessageCircle,
  Star as StarIcon,
  X,
} from "lucide-react";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "../firebaseConfig";

type RangeOption = "Last 7 days" | "Last 30 days" | "Quarter to date";

type ReviewTag = "new" | "reviewed" | "flagged";

type Review = {
  id: number;
  reviewer: string;
  rating: number;
  tag: ReviewTag;
  message: string;
  timestamp: string;
};

type NegativeReview = Review & {
  reason: string;
};

const REVIEW_TAG_STYLES: Record<ReviewTag, string> = {
  new: "bg-gray-900 text-white",
  reviewed: "bg-gray-200 text-gray-800",
  flagged: "bg-red-500 text-white",
};





const rangeOptions: RangeOption[] = ["Last 7 days", "Last 30 days", "Quarter to date"];

const getDateRangeFilter = (range: RangeOption): Date => {
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
      // Calculate start of current quarter
      const currentMonth = now.getMonth();
      const quarterStartMonth = Math.floor(currentMonth / 3) * 3;
      result.setMonth(quarterStartMonth);
      result.setDate(1);
      result.setHours(0, 0, 0, 0);
      break;
  }
  
  return result;
};

const getTimeAgo = (date: Date): string => {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days > 1 ? 's' : ''} ago`;
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

function CustomerServiceDashboardPage() {
  const [selectedRange, setSelectedRange] = useState<RangeOption>("Last 30 days");
  const [isRangeMenuOpen, setIsRangeMenuOpen] = useState(false);
  const [isNegativeDrawerOpen, setIsNegativeDrawerOpen] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [negativeReviews, setNegativeReviews] = useState<NegativeReview[]>([]);
  const [stats, setStats] = useState({ totalReviews: 0, avgRating: 0, responseRate: 0, rewardsRedeemed: 0 });

  const handleCycleRange = () => {
    const currentIndex = rangeOptions.indexOf(selectedRange);
    const nextIndex = (currentIndex + 1) % rangeOptions.length;
    setSelectedRange(rangeOptions[nextIndex]);
    setIsRangeMenuOpen(false);
  };

  const handleSelectRange = (option: RangeOption) => {
    setSelectedRange(option);
    setIsRangeMenuOpen(false);
  };

  useEffect(() => {
    const q = query(collection(db, "feedback"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const filterDate = getDateRangeFilter(selectedRange);
      const allReviews: Review[] = [];
      const flaggedReviews: NegativeReview[] = [];
      let totalRating = 0;
      let rewardsCount = 0;
      
      snapshot.forEach((doc) => {
        const data = doc.data();
        const createdAt = data.createdAt?.toDate();
        
        // Filter by date range
        if (createdAt && createdAt < filterDate) {
          return; // Skip reviews outside the selected date range
        }
        
        const timeAgo = createdAt ? getTimeAgo(createdAt) : "Just now";
        
        const review: Review = {
          id: parseInt(doc.id.slice(-6), 36),
          reviewer: "Customer",
          rating: data.rating || 0,
          tag: data.rating <= 2 ? "flagged" : "new",
          message: data.comments || "No comment provided",
          timestamp: timeAgo,
        };
        
        allReviews.push(review);
        totalRating += data.rating || 0;
        
        if (data.rating >= 4) rewardsCount++;
        
        if (data.rating <= 2) {
          flaggedReviews.push({
            ...review,
            reason: "Low rating feedback",
          });
        }
      });
      
      const total = snapshot.size;
      const avgRating = total > 0 ? totalRating / total : 0;
      const responseRate = total > 0 ? Math.round((total / (total + negativeReviews.length)) * 100) : 0;
      
      setReviews(allReviews.slice(0, 20));
      setNegativeReviews(flaggedReviews);
      setStats({
        totalReviews: total,
        avgRating: Math.round(avgRating * 10) / 10,
        responseRate,
        rewardsRedeemed: rewardsCount
      });
    });
    
    return () => unsubscribe();
  }, [selectedRange]); // Re-run when selectedRange changes

  return (
    <div className="min-h-screen bg-gray-100 font-sans text-gray-900">
      <div className="relative mx-auto flex max-w-md flex-col px-5 py-6">
        {/* header removed: title/subtitle duplicated in Business Portal; content flows directly into stats */}

        <section className="mt-6 flex items-center justify-end gap-3">
          <div className="relative flex-1 max-w-xs">
            <button
              type="button"
              onClick={() => (isRangeMenuOpen ? handleCycleRange() : setIsRangeMenuOpen(true))}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800 transition-colors"
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
                  {rangeOptions.map((option) => (
                    <li key={option}>
                      <button
                        type="button"
                        onClick={() => handleSelectRange(option)}
                        className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm ${
                          option === selectedRange
                            ? "bg-gray-900 text-white"
                            : "text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        {option}
                        {option === selectedRange && <span className="text-xs font-medium">Active</span>}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </section>

        <section className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center justify-between rounded-xl bg-white p-4 shadow-sm">
            <div className="space-y-2">
              <p className="text-sm font-semibold uppercase tracking-wide text-gray-500">Total Reviews</p>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-gray-900">{stats.totalReviews}</span>
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

        <section className="mt-8 space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Recent Reviews</h2>
            <p className="text-sm text-gray-500">Latest customer feedback requiring attention</p>
          </div>

          <div className="space-y-3">
            {reviews.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No reviews yet</p>
            ) : (
              reviews.map((review) => (
              <article key={review.id} className="space-y-3 rounded-xl bg-white p-4 shadow-sm">
                <div className="flex items-start justify-between">
                  <p className="text-base font-semibold text-gray-900">{review.reviewer}</p>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${REVIEW_TAG_STYLES[review.tag]}`}
                  >
                    {review.tag}
                  </span>
                </div>
                <div className="text-sm text-yellow-400">{renderStars(review.rating)}</div>
                <p className="text-sm leading-relaxed text-gray-600">{review.message}</p>
                <p className="text-xs text-gray-400">{review.timestamp}</p>
              </article>
            ))
            )}
          </div>
        </section>

        <section className="mt-8 space-y-3">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Action Items</h2>
            <p className="text-sm text-gray-500">Tasks that need your attention</p>
          </div>

          {negativeReviews.length > 0 && (
            <div className="flex items-center gap-4 rounded-xl bg-red-50 p-4 shadow-sm">
              <span className="text-red-600">
                <AlertTriangle className="h-6 w-6" />
              </span>
              <div className="flex-1 space-y-1">
                <p className="text-base font-semibold text-red-700">{negativeReviews.length} Negative Review{negativeReviews.length > 1 ? 's' : ''}</p>
                <p className="text-sm text-red-600">Require immediate response and follow-up</p>
              </div>
              <button
                type="button"
                onClick={() => setIsNegativeDrawerOpen(true)}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
              >
                Review Now
              </button>
            </div>
          )}
        </section>
      </div>

      {isNegativeDrawerOpen && (
        <div className="fixed inset-0 z-40 flex items-end bg-black/30 backdrop-blur-sm" onClick={() => setIsNegativeDrawerOpen(false)}>
          <div className="w-full rounded-t-3xl bg-white shadow-2xl max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex-shrink-0 flex items-start justify-between p-6 pb-4 border-b border-gray-200">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-red-500">
                  Flagged Reviews
                </p>
                <h3 className="mt-1 text-lg font-semibold text-gray-900">
                  Needs immediate follow-up
                </h3>
                <p className="text-sm text-gray-500">
                  Contact these guests within 24 hours to recover their experiences.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsNegativeDrawerOpen(false)}
                className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 flex-shrink-0"
                aria-label="Close drawer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-4">
              <div className="space-y-3">
                {negativeReviews.map((review) => (
                  <article
                    key={review.id}
                    className="space-y-2 rounded-xl border border-red-100 bg-red-50/60 p-4"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-gray-900">{review.reviewer}</p>
                      <span className="rounded-full bg-red-100 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-red-700">
                        Flagged
                      </span>
                    </div>
                    <div className="text-sm text-yellow-400">{renderStars(review.rating)}</div>
                    <p className="text-sm leading-relaxed text-gray-700">{review.message}</p>
                    <p className="text-xs text-gray-400">{review.timestamp}</p>
                    <p className="text-xs font-medium text-red-600">Reason: {review.reason}</p>
                  </article>
                ))}
              </div>
            </div>

            <div className="flex-shrink-0 flex items-center justify-center gap-3 p-6 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={() => setIsNegativeDrawerOpen(false)}
                className="rounded-lg bg-gray-900 px-10 py-3 text-sm font-semibold text-white hover:bg-gray-800 transition-colors"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CustomerServiceDashboardPage;
