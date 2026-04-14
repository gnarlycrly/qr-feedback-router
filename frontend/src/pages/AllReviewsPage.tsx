import { useEffect, useState } from "react";
import { Calendar, Star as StarIcon } from "lucide-react";
import { collection, query, where, orderBy, onSnapshot } from "firebase/firestore";
import { useAuth } from "../firebaseHelpers/AuthContext";
import { db } from "../firebaseConfig";
import { useNavigate } from "react-router-dom";
import { useSubscription } from "../firebaseHelpers/useSubscription";
import UpgradeBanner from "../components/UpgradeBanner";

type RawReview = {
  docId: string;
  reviewer: string;
  rating: number;
  message: string;
  timestamp: string;
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

export default function AllReviewsPage() {
  const { businessId } = useAuth();
  const { isPro } = useSubscription();
  const [reviews, setReviews] = useState<RawReview[]>([]);
  const navigate = useNavigate();
  const [selectedRange, setSelectedRange] = useState<"Last 7 days" | "Last 30 days" | "Quarter to date" | "Show all reviews">("Last 7 days");
  const [isRangeMenuOpen, setIsRangeMenuOpen] = useState(false);

  const rangeOptions: Array<typeof selectedRange> = ["Last 7 days", "Last 30 days", "Quarter to date", "Show all reviews"];

  const getDateRangeFilter = (range: typeof selectedRange): Date | null => {
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

  const handleCycleRange = () => {
    const currentIndex = rangeOptions.indexOf(selectedRange);
    const nextIndex = (currentIndex + 1) % rangeOptions.length;
    setSelectedRange(rangeOptions[nextIndex]);
    setIsRangeMenuOpen(false);
  };

  const handleSelectRange = (option: typeof selectedRange) => {
    if (!isPro && option !== "Last 7 days") return;
    setSelectedRange(option);
    setIsRangeMenuOpen(false);
  };

  // Star filters: allow selecting any combination of 1-5 stars
  const [selectedStars, setSelectedStars] = useState<Set<number>>(new Set());
  const toggleStar = (n: number) => {
    setSelectedStars((prev) => {
      const next = new Set(prev);
      if (next.has(n)) next.delete(n);
      else next.add(n);
      return next;
    });
  };

  useEffect(() => {
    if (!businessId) return;

    const filterDate = getDateRangeFilter(selectedRange);

    const base = collection(db, "feedback");
    const q = filterDate
      ? query(base, where("businessId", "==", businessId), where("createdAt", ">=", filterDate), orderBy("createdAt", "desc"))
      : query(base, where("businessId", "==", businessId), orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetched: RawReview[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        const createdAt = data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt;
        fetched.push({
          docId: docSnap.id,
          reviewer: data.reviewerName || "Customer",
          rating: data.rating || 0,
          message: data.comments || "No comment provided",
          timestamp: createdAt ? new Date(createdAt).toLocaleString() : "Just now",
        });
      });

      setReviews(fetched);
    });

    return () => unsubscribe();
  }, [businessId, selectedRange]);

  // Compute counts for each rounded star rating (1-5) to show in the filter buttons
  const starCounts: Record<number, number> = [1, 2, 3, 4, 5].reduce((acc, n) => {
    acc[n] = 0;
    return acc;
  }, {} as Record<number, number>);

  for (const r of reviews) {
    const rating = Math.round(r.rating || 0);
    if (rating >= 1 && rating <= 5) {
      starCounts[rating] = (starCounts[rating] || 0) + 1;
    }
  }

  return (
    <div className="max-w-7xl mx-auto">
      <main className="rounded-2xl shadow-lg border border-gray-100 bg-gray-50 overflow-visible">
  <div className="max-w-3xl mx-auto w-full h-[calc(100vh-220px)] flex flex-col bg-white rounded-2xl p-6">
          <div className="flex items-center justify-between py-4">
            <div>
              <h1 className="text-2xl font-bold">All Customer Reviews</h1>
              <p className="text-sm text-gray-600">All feedback received for your business, newest first.</p>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative">
                <button
                  type="button"
                  onClick={() => (isRangeMenuOpen ? handleCycleRange() : setIsRangeMenuOpen(true))}
                  className={`flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
            isRangeMenuOpen
              ? "bg-linear-to-r from-[#F2C125] to-[#FF8C1A] text-white hover:opacity-95"
              : "bg-white text-black border border-gray-200 hover:bg-linear-to-r hover:from-[#F2C125] hover:to-[#FF8C1A] hover:text-white"
                  }`}
                >
                  <Calendar className="h-4 w-4" />
                  {selectedRange}
                </button>

                {isRangeMenuOpen && (
                  <div className="absolute right-0 bottom-full z-10 mb-2 w-56 rounded-xl border border-gray-200 bg-white p-2 shadow-lg">
                    <p className="px-2 pb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">Choose range</p>
                    <ul className="space-y-1">
                      {rangeOptions.map((option) => {
                        const locked = !isPro && option !== "Last 7 days";
                        return (
                        <li key={option} className="relative group">
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
                  onClick={() => navigate('/portal?tab=reviews')}
                  className="rounded-lg bg-linear-to-r from-[#F2C125] to-[#FF8C1A] px-4 py-2 text-sm font-medium text-white hover:opacity-95 transition"
                >
                  Back
                </button>
              </div>
            </div>
          </div>

          {/* Star filters: choose any combination of 1-5 to filter results */}
          <div className="pt-2 flex flex-col flex-1 min-h-0 overflow-visible">
            <div className="w-full flex flex-col items-center gap-3">
              <p className="text-sm font-medium text-gray-700">Filter by rating:</p>
              <div className="w-full flex items-center justify-center gap-3 overflow-x-auto">
                {[1, 2, 3, 4, 5].map((n) => {
                  const active = selectedStars.has(n);
                  const starIconClass = active ? "h-4 w-4 text-white" : "h-4 w-4 text-yellow-400";
                  return (
                    <button
                      key={n}
                      type="button"
                      aria-pressed={active}
                      onClick={() => toggleStar(n)}
                      className={
                        "inline-flex items-center gap-1 rounded-md px-3 py-1 text-sm font-medium transition-colors whitespace-nowrap " +
                          (active
                          ? "bg-linear-to-r from-[#F2C125] to-[#FF8C1A] text-white"
                          : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50")
                      }
                    >
                      <span className="inline-flex">
                        {Array.from({ length: n }).map((_, i) => (
                          <StarIcon key={i} className={starIconClass} />
                        ))}
                      </span>
                      <span className="ml-2 text-xs text-gray-500">({starCounts[n] ?? 0})</span>
                    </button>
                  );
                })}
                <button
                  type="button"
                  onClick={() => setSelectedStars(new Set())}
                  className="ml-2 text-sm text-gray-500 hover:text-gray-700"
                >
                  Clear
                </button>
              </div>
            </div>

            <div className="w-full overflow-y-auto flex-1 space-y-3 pb-6 min-h-0 mt-4">
              {(() => {
                const filtered = reviews.filter((r) => {
                  if (selectedStars.size === 0) return true;
                  const rating = Math.round(r.rating || 0);
                  return selectedStars.has(rating);
                });

                if (filtered.length === 0) return <p className="text-center text-gray-500 py-8">No reviews match the selected filters</p>;

                return (
                  <>
                    {filtered.map((r, idx) => {
                      const isBlurred = !isPro && idx >= 10;
                      return (
                      <article key={r.docId} className={`space-y-2 rounded-xl bg-white p-4 shadow-sm ${isBlurred ? "blur-sm pointer-events-none select-none" : ""}`}>
                        <div className="flex items-start justify-between">
                          <p className="text-base font-semibold text-gray-900">{r.reviewer}</p>
                          <p className="text-xs text-gray-400">{r.timestamp}</p>
                        </div>

                        <div className="text-sm text-yellow-400">{renderStars(r.rating)}</div>
                        <p className="text-sm leading-relaxed text-gray-600">{r.message}</p>
                      </article>
                      );
                    })}
                    {!isPro && filtered.length > 10 && (
                      <UpgradeBanner feature="All Reviews" />
                    )}
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
