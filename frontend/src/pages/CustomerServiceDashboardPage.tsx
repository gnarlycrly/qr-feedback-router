import { useEffect, useRef, useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  ArrowUpRight,
  Calendar,
  Download,
  Gift,
  Menu,
  MessageCircle,
  Star as StarIcon,
  Users,
  X,
} from "lucide-react";

type RangeOption = "Last 7 days" | "Last 30 days" | "Quarter to date";

type StatTrend = {
  label: string;
  colorClass: string;
};

type StatCardData = {
  id: string;
  title: string;
  value: string;
  icon: LucideIcon;
  iconColorClass: string;
  rating?: number;
  trend?: StatTrend;
};

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

const STAT_CARDS: StatCardData[] = [
  {
    id: "total-reviews",
    title: "Total Reviews",
    value: "247",
    icon: MessageCircle,
    iconColorClass: "text-blue-500",
  },
  {
    id: "average-rating",
    title: "Average Rating",
    value: "4.7",
    rating: 4.7,
    icon: StarIcon,
    iconColorClass: "text-yellow-400",
  },
  {
    id: "response-rate",
    title: "Response Rate",
    value: "89%",
    icon: Users,
    iconColorClass: "text-green-500",
    trend: {
      label: "+5% from last month",
      colorClass: "text-green-600",
    },
  },
  {
    id: "rewards-redeemed",
    title: "Rewards Redeemed",
    value: "156",
    icon: Gift,
    iconColorClass: "text-purple-500",
    trend: {
      label: "+8% from last month",
      colorClass: "text-purple-600",
    },
  },
];

const RECENT_REVIEWS: Review[] = [
  {
    id: 1,
    reviewer: "Sarah M.",
    rating: 5,
    tag: "new",
    message: "Amazing food and excellent service! We will definitely be back again.",
    timestamp: "2 hours ago",
  },
  {
    id: 2,
    reviewer: "John D.",
    rating: 4,
    tag: "reviewed",
    message: "Great atmosphere and friendly staff. The wait time was a bit long, but worth it!",
    timestamp: "5 hours ago",
  },
  {
    id: 3,
    reviewer: "Maria L.",
    rating: 2,
    tag: "flagged",
    message: "Food was cold when it arrived and the staff seemed overwhelmed.",
    timestamp: "1 day ago",
  },
];

const NEGATIVE_REVIEWS: NegativeReview[] = [
  {
    id: 11,
    reviewer: "Maria L.",
    rating: 2,
    tag: "flagged",
    message: "Food was cold when it arrived and the staff seemed overwhelmed.",
    timestamp: "1 day ago",
    reason: "Temperature and service delays",
  },
  {
    id: 12,
    reviewer: "Travis P.",
    rating: 1,
    tag: "flagged",
    message: "Staff forgot my order twice and the manager never came to apologize.",
    timestamp: "3 days ago",
    reason: "Order accuracy",
  },
  {
    id: 13,
    reviewer: "Leah S.",
    rating: 2,
    tag: "flagged",
    message: "Music was way too loud and ruined our dinner. Food was just ok.",
    timestamp: "4 days ago",
    reason: "In-store experience",
  },
];

const rangeOptions: RangeOption[] = ["Last 7 days", "Last 30 days", "Quarter to date"];

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
  const [exportQueued, setExportQueued] = useState(false);
  const exportTimeoutRef = useRef<number | null>(null);

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

  const handleExportReport = () => {
    if (exportTimeoutRef.current) {
      window.clearTimeout(exportTimeoutRef.current);
    }
    setExportQueued(true);
    exportTimeoutRef.current = window.setTimeout(() => {
      setExportQueued(false);
      exportTimeoutRef.current = null;
    }, 2400);
  };

  useEffect(() => {
    return () => {
      if (exportTimeoutRef.current) {
        window.clearTimeout(exportTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 font-sans text-gray-900">
      <div className="relative mx-auto flex max-w-md flex-col px-5 py-6">
        <header className="space-y-3">
          <div className="flex items-center justify-between">
            <button
              type="button"
              className="rounded-full p-2 text-gray-700 hover:bg-gray-200"
              aria-label="Open navigation menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="flex flex-col items-center">
              <h1 className="text-xl font-semibold text-gray-900">Dashboard Overview</h1>
              <p className="text-center text-xs text-gray-500">
                Monitor your customer feedback and business performance
              </p>
            </div>
            <span className="h-9 w-9" aria-hidden />
          </div>
        </header>

        <section className="mt-6 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleExportReport}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:border-gray-400"
          >
            <Download className="h-4 w-4" />
            Export Report
          </button>
          <div className="relative flex-1">
            <button
              type="button"
              onClick={() => (isRangeMenuOpen ? handleCycleRange() : setIsRangeMenuOpen(true))}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white"
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

        {exportQueued && (
          <div className="mt-3 flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-2 text-sm text-green-700">
            <ArrowUpRight className="h-4 w-4 rotate-45 text-green-500" />
            Export queued - you&apos;ll receive an email shortly.
          </div>
        )}

        <section className="mt-8 space-y-4">
          {STAT_CARDS.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.id}
                className="flex items-center justify-between rounded-xl bg-white p-4 shadow-sm"
              >
                <div className="space-y-2">
                  <p className="text-sm font-semibold uppercase tracking-wide text-gray-500">
                    {card.title}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-gray-900">{card.value}</span>
                    {card.rating && renderStars(card.rating)}
                  </div>
                  {card.trend && (
                    <p className={`flex items-center gap-1 text-sm font-medium ${card.trend.colorClass}`}>
                      <ArrowUpRight className="h-4 w-4" />
                      {card.trend.label}
                    </p>
                  )}
                </div>
                <div className="grid h-12 w-12 place-items-center rounded-full bg-gray-50">
                  <Icon className={`h-6 w-6 ${card.iconColorClass}`} />
                </div>
              </div>
            );
          })}
        </section>

        <section className="mt-8 space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Recent Reviews</h2>
            <p className="text-sm text-gray-500">Latest customer feedback requiring attention</p>
          </div>

          <div className="space-y-3">
            {RECENT_REVIEWS.map((review) => (
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
            ))}
          </div>
        </section>

        <section className="mt-8 space-y-3">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Action Items</h2>
            <p className="text-sm text-gray-500">Tasks that need your attention</p>
          </div>

          <div className="flex items-center gap-4 rounded-xl bg-red-50 p-4 shadow-sm">
            <span className="text-red-600">
              <AlertTriangle className="h-6 w-6" />
            </span>
            <div className="flex-1 space-y-1">
              <p className="text-base font-semibold text-red-700">3 Negative Reviews</p>
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
        </section>
      </div>

      {isNegativeDrawerOpen && (
        <div className="fixed inset-0 z-40 flex flex-col bg-black/30 backdrop-blur-sm">
          <button
            type="button"
            aria-label="Close negative reviews overlay"
            onClick={() => setIsNegativeDrawerOpen(false)}
            className="flex-1"
          />
          <div className="mt-auto space-y-5 rounded-t-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between">
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
                className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                aria-label="Close drawer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3">
              {NEGATIVE_REVIEWS.map((review) => (
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

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsNegativeDrawerOpen(false)}
                className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100"
              >
                Close
              </button>
              <button
                type="button"
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
              >
                Log Follow-ups
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CustomerServiceDashboardPage;
