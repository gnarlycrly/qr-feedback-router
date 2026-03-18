// Dashboard for customer service teams — shows quick stats, recent reviews and action items.
import { useEffect, useState, useMemo } from "react";
import {
  AlertTriangle,
  Calendar,
  Check,
  MessageCircle,
  Star as StarIcon,
  X,
} from "lucide-react";
import { collection, query, where, orderBy, onSnapshot, arrayUnion } from "firebase/firestore";
import { useAuth } from "../firebaseHelpers/AuthContext";
import { useBusinessData } from "../firebaseHelpers/useBusinessData";
import { useUpdateBusinessData } from "../firebaseHelpers/useUpdateBusinessData";
import { db } from "../firebaseConfig";
import InfoTooltip from "../components/InfoTooltip";
import { useSubscription } from "../firebaseHelpers/useSubscription";
import UpgradeBanner from "../components/UpgradeBanner";

type RangeOption = "Last 7 days" | "Last 30 days" | "Quarter to date" | "Show all reviews";

type ReviewTag = "new" | "reviewed" | "flagged";

type RawReview = {
  docId: string;
  reviewer: string;
  rating: number;
  message: string;
  timestamp: string;
  isOlderThanWeek: boolean;
};

type Review = RawReview & {
  id: number;
  tag: ReviewTag | null;
};

type NegativeReview = Review & {
  reason: string;
};

// REVIEW_TAG_STYLES removed — detailed per-review tags are shown on the All Reviews page now.

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

const getTimeAgo = (date: Date): string => {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days > 1 ? "s" : ""} ago`;
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
  const { isPro } = useSubscription();
  const [selectedRange, setSelectedRange] = useState<RangeOption>("Last 7 days");
  const [isRangeMenuOpen, setIsRangeMenuOpen] = useState(false);
  const [isNegativeDrawerOpen, setIsNegativeDrawerOpen] = useState(false);
  const [rawReviews, setRawReviews] = useState<RawReview[]>([]);
  const [threshold, setThreshold] = useState(2);
  const [resolvedIds, setResolvedIds] = useState<Set<string>>(new Set());
  const { businessId } = useAuth();
  const { business } = useBusinessData();
  const updateBusinessData = useUpdateBusinessData();

  // Free tier: restrict to 7-day range only
  const freeRangeOptions: RangeOption[] = ["Last 7 days"];
  const effectiveRangeOptions = isPro ? rangeOptions : freeRangeOptions;

  // Initialise threshold and resolved IDs from saved business data
  useEffect(() => {
    if (!business) return;
    if (business.flaggingThreshold !== undefined) setThreshold(business.flaggingThreshold);
    if (business.resolvedReviewIds) setResolvedIds(new Set(business.resolvedReviewIds));
  }, [business]);

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

  // Fetch raw review data from Firestore (real-time listener)
  useEffect(() => {
    if (!businessId) return;
    const q = query(
      collection(db, "feedback"),
      where("businessId", "==", businessId),
      orderBy("createdAt", "desc"),
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const filterDate = getDateRangeFilter(selectedRange);
      const fetched: RawReview[] = [];

      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        const createdAt = data.createdAt?.toDate();

        // Filter by date range (null filterDate means show all)
        if (filterDate && createdAt && createdAt < filterDate) return;

        const isOlderThanWeek = createdAt
          ? (new Date().getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24) > 7
          : false;

        fetched.push({
          docId: docSnap.id,
          reviewer: "Customer",
          rating: data.rating || 0,
          message: data.comments || "No comment provided",
          timestamp: createdAt ? getTimeAgo(createdAt) : "Just now",
          isOlderThanWeek,
        });
      });

      setRawReviews(fetched);
    });

    return () => unsubscribe();
  }, [selectedRange, businessId]);

  // Derive displayed reviews — tags react to threshold & resolved changes
  const reviews: Review[] = useMemo(() => {
    return rawReviews.map((r) => ({
      ...r,
      id: parseInt(r.docId.slice(-6), 36),
      tag: resolvedIds.has(r.docId)
        ? ("reviewed" as ReviewTag)
        : r.rating <= threshold
          ? ("flagged" as ReviewTag)
          : r.isOlderThanWeek
            ? null
            : ("new" as ReviewTag),
    }));
  }, [rawReviews, resolvedIds, threshold]);

  // Aggregate stats (all reviews in the date range, unaffected by resolved status)
  const stats = useMemo(() => {
    const total = rawReviews.length;
    const sum = rawReviews.reduce((acc, r) => acc + r.rating, 0);
    return {
      totalReviews: total,
      avgRating: total > 0 ? Math.round((sum / total) * 10) / 10 : 0,
    };
  }, [rawReviews]);

  // Unresolved flagged reviews for the Action Items section
  const unresolvedFlagged: NegativeReview[] = useMemo(() => {
    return reviews
      .filter((r) => r.tag === "flagged")
      .map((r) => ({ ...r, reason: "Low rating feedback" }));
  }, [reviews]);

  // Persist a new flagging threshold
  const handleThresholdChange = async (value: number) => {
    setThreshold(value);
    try {
      await updateBusinessData({ flaggingThreshold: value });
    } catch (err) {
      console.error("Error saving threshold:", err);
    }
  };

  // Mark a single review as resolved
  const handleResolve = async (docId: string) => {
    setResolvedIds((prev) => {
      const next = new Set(prev);
      next.add(docId);
      return next;
    });
    try {
      await updateBusinessData({ resolvedReviewIds: arrayUnion(docId) });
    } catch (err) {
      console.error("Error resolving review:", err);
    }
  };

  // Undo a resolved review — handled from the All Reviews screen if needed.

  return (
    // Cap the review monitoring tab height and make the inner content scrollable
    <div className="max-w-3xl mx-auto w-full max-h-[calc(100vh-220px)] flex flex-col">
      <div className="overflow-auto flex-1 space-y-4">
        {/* Header + Date range selector */}
        <section className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Review Monitoring</h1>
            <p className="text-base text-gray-600">Monitor customer feedback and reviews <InfoTooltip text="Track incoming reviews in real time. Negative reviews are flagged as action items for follow-up." /></p>
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

            <div>
              <button
                type="button"
                onClick={() => window.location.assign('/portal/reviews')}
                className="rounded-lg bg-linear-to-r from-[#F2C125] to-[#FF8C1A] px-3 py-2 text-sm font-medium text-white hover:opacity-95 transition"
              >
                View Reviews
              </button>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center justify-between rounded-xl bg-white p-4 shadow-sm">
            <div className="space-y-2">
              <p className="text-sm font-semibold uppercase tracking-wide text-gray-500">
                {selectedRange === "Show all reviews" ? "Total Reviews" : `Total Reviews in the ${getTimePeriodLabel(selectedRange)}`}
              </p>
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

        {/* Action Items */}
        <section className="space-y-3">
          <div>
            <div className="flex items-center gap-1">
              <h2 className="text-lg font-semibold text-gray-900">Action Items</h2>
              <InfoTooltip text="Flagged reviews that need your attention. Mark them as resolved once you've followed up with the customer." />
            </div>
            <p className="text-sm text-gray-500">Tasks that need your attention</p>
          </div>

          {/* Flagging threshold setting */}
          <div className="flex items-center gap-2 rounded-lg bg-white px-4 py-3 shadow-sm text-sm">
            <span className="text-gray-600">Flag reviews rated</span>
            <select
              value={threshold}
              onChange={(e) => handleThresholdChange(Number(e.target.value))}
              className="rounded-md border border-gray-200 bg-white px-2 py-1 text-sm font-semibold text-gray-800 cursor-pointer"
            >
              {[1, 2, 3, 4].map((n) => (
                <option key={n} value={n}>
                  {n} {n === 1 ? "star" : "stars"}
                </option>
              ))}
            </select>
            <span className="text-gray-600">or below</span>
            <InfoTooltip text="Default is 2 stars. Reviews at or below this rating are flagged as action items for follow-up." />
          </div>

          {unresolvedFlagged.length > 0 && (
            <div className="flex items-center gap-4 rounded-xl bg-red-50 p-4 shadow-sm">
              <span className="text-red-600">
                <AlertTriangle className="h-6 w-6" />
              </span>
              <div className="flex-1 space-y-1">
                <p className="text-base font-semibold text-red-700">
                  {unresolvedFlagged.length} Negative Review{unresolvedFlagged.length > 1 ? "s" : ""}
                </p>
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

        {/* Customer Reviews moved to separate All Reviews page - list removed from dashboard */}
      </div>

      {/* Flagged Reviews Drawer */}
      {isNegativeDrawerOpen && (
        <div
          className="fixed inset-0 z-40 flex items-end bg-black/30 backdrop-blur-sm"
          onClick={() => setIsNegativeDrawerOpen(false)}
        >
          <div
            className="w-full rounded-t-3xl bg-white shadow-2xl max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="shrink-0 flex items-start justify-between p-6 pb-4 border-b border-gray-200">
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
                className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 shrink-0"
                aria-label="Close drawer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-4">
              <div className="space-y-3">
                {unresolvedFlagged.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">All flagged reviews have been resolved.</p>
                ) : (
                  unresolvedFlagged.map((review, idx) => {
                    const isBlurred = !isPro && idx >= 3;
                    return (
                    <article
                      key={review.docId}
                      className={`space-y-2 rounded-xl border border-red-100 bg-red-50/60 p-4 ${isBlurred ? "blur-sm pointer-events-none select-none" : ""}`}
                    >
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-gray-900">{review.reviewer}</p>
                        <span className="rounded-full bg-red-100 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-red-700">
                          Flagged
                        </span>
                      </div>
                      <div className="text-sm text-yellow-400">{renderStars(review.rating)}</div>
                      <p className="text-sm leading-relaxed text-gray-700">{review.message}</p>
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-gray-400">{review.timestamp}</p>
                        {isPro ? (
                        <button
                          type="button"
                          onClick={() => handleResolve(review.docId)}
                          className="flex items-center gap-1.5 rounded-md bg-white px-3 py-1.5 text-xs font-medium text-gray-700 shadow-sm hover:bg-gray-50 transition-colors"
                        >
                          <Check size={13} />
                          Mark Resolved
                        </button>
                        ) : (
                          <span className="text-xs text-gray-400">Pro feature</span>
                        )}
                      </div>
                    </article>
                    );
                  })
                )}
              </div>
            </div>

            {!isPro && unresolvedFlagged.length > 3 && (
              <div className="px-6 pt-2">
                <UpgradeBanner feature="Full Action Items" />
              </div>
            )}

            <div className="shrink-0 flex items-center justify-center gap-3 p-6 pt-4 border-t border-gray-200">
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
