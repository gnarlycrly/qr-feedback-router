// Simplified Reward page: shows reward directly without authentication
import { useState, useEffect, type ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";

type RewardDetails = {
  customerReview: {
    rating: number;
    comment: string;
  };
  businessName: string;
  reward: {
    title: string;
    description: string;
    promoCode: string;
    validityDays: number;
    terms: string;
  };
};

const ratingScale = 5;

const mockRewardData: RewardDetails = {
  customerReview: {
    rating: 5,
    comment: "amazing food amazing service!",
  },
  businessName: "Sample Business",
  reward: {
    title: "Special Thank You Offer!",
    description: "20% off your next meal",
    promoCode: "THANK20",
    validityDays: 30,
    terms: "Valid for 30 days. Cannot be combined with other offers.",
  },
};

const RewardLayout = ({
  businessName,
  children,
}: {
  businessName: string;
  children: ReactNode;
}) => {
  return (
    <div className="flex min-h-screen flex-col bg-app-surface">
      <header className="bg-white shadow-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div>
            <p className="text-lg font-semibold text-gray-800">
              Absolutely Brilliant
            </p>
            <p className="text-xs text-gray-400">
              {businessName} · Customer Rewards
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="rounded-full px-3 py-1 text-xs font-medium bg-green-50 text-green-600">
              Thank you!
            </span>
          </div>
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center px-4 py-8">
        {children}
      </main>
    </div>
  );
};

const RewardContent = ({
  copied,
  onCopy,
  rewardData,
}: {
  copied: boolean;
  onCopy: () => Promise<void>;
  rewardData: RewardDetails;
}) => {
  const renderStars = (rating: number) => (
    <div
      className="flex items-center gap-1"
      aria-label={`Rated ${rating} out of ${ratingScale}`}
    >
      {Array.from({ length: ratingScale }).map((_, index) => (
        <span
          key={index}
          aria-hidden="true"
          className={`text-lg ${
            index < rating ? "text-yellow-400" : "text-gray-300"
          }`}
        >
          ★
        </span>
      ))}
      <span className="ml-1 text-sm text-gray-500">
        ({rating}/{ratingScale})
      </span>
    </div>
  );

  return (
    <article className="w-full max-w-md rounded-3xl bg-white px-6 py-10 shadow-lg sm:px-10">
      <section className="flex flex-col items-center gap-4 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
          <svg
            className="h-10 w-10 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={3}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <div>
          <h2 className="text-3xl font-bold text-green-600">Thank You!</h2>
          <p className="mt-2 text-sm text-gray-500">
            Your feedback has been submitted successfully.
          </p>
        </div>
      </section>

      {rewardData.customerReview.rating > 0 && (
        <section className="mt-6 rounded-2xl bg-gray-50 p-5">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-gray-800">Your Review</h3>
            {renderStars(rewardData.customerReview.rating)}
          </div>
          {rewardData.customerReview.comment && (
            <p className="mt-2 text-sm italic text-gray-600">
              &ldquo;{rewardData.customerReview.comment}&rdquo;
            </p>
          )}
        </section>
      )}

      <p className="mt-6 text-center text-sm leading-relaxed text-gray-500">
        We truly appreciate you taking the time to share your experience with{" "}
        <span className="font-semibold text-gray-700">
          {rewardData.businessName}
        </span>
        . Enjoy this thank-you offer on us!
      </p>

      <section className="mt-6 rounded-3xl border border-blue-100 bg-blue-50 p-6">
        <div className="flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
            <svg
              className="h-8 w-8 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"
              />
            </svg>
          </div>
        </div>

        <div className="mt-4 text-center">
          <h3 className="text-xl font-bold text-blue-600">
            {rewardData.reward.title}
          </h3>
          <p className="mt-1 text-base text-gray-700">
            {rewardData.reward.description}
          </p>
        </div>

        <div className="mt-5 flex items-center justify-center gap-2">
          <div className="rounded-xl border border-gray-300 bg-white px-5 py-3">
            <p className="text-xl font-bold tracking-[0.35em] text-gray-900">
              {rewardData.reward.promoCode}
            </p>
          </div>
          <button
            type="button"
            onClick={onCopy}
            className="rounded-xl border border-gray-300 bg-white p-3 transition duration-150 hover:bg-gray-50 active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400"
            aria-label={
              copied ? "Promo code copied to clipboard" : "Copy promo code"
            }
          >
            {copied ? (
              <svg
                className="h-5 w-5 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            ) : (
              <svg
                className="h-5 w-5 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
            )}
          </button>
        </div>
        <span aria-live="polite" className="sr-only">
          {copied ? "Promo code copied to clipboard" : ""}
        </span>

        <p className="mt-3 text-center text-xs text-gray-500">
          {rewardData.reward.terms}
        </p>

        <div className="mt-5 flex flex-col items-center">
          <p className="text-center text-xs text-gray-500">
            Show this code at checkout
          </p>
        </div>
      </section>

      <footer className="mt-6 space-y-4 text-center">
        <p className="flex items-center justify-center gap-1 text-sm text-gray-500">
          We look forward to serving you again soon!
        </p>
      </footer>
    </article>
  );
};

function RewardPage() {
  const [copied, setCopied] = useState(false);
  const [businessName, setBusinessName] = useState<string>(mockRewardData.businessName);
  const location = useLocation();

  // Get feedback data and business info from navigation state
  const feedbackData = (location.state as any)?.feedback || {
    rating: mockRewardData.customerReview.rating,
    comment: mockRewardData.customerReview.comment,
  };

  const businessId = (location.state as any)?.businessId;

  // Load business data from Firestore if businessId is provided
  useEffect(() => {
    const loadBusinessData = async () => {
      if (businessId) {
        try {
          const businessDoc = await getDoc(doc(db, "businesses", businessId));
          if (businessDoc.exists()) {
            const data = businessDoc.data();
            setBusinessName(data.name || mockRewardData.businessName);
          }
        } catch (error) {
          console.error("Error loading business data:", error);
        }
      }
    };
    loadBusinessData();
  }, [businessId]);

  const rewardData: RewardDetails = {
    customerReview: {
      rating: feedbackData.rating || mockRewardData.customerReview.rating,
      comment: feedbackData.comment || mockRewardData.customerReview.comment,
    },
    businessName: businessName,
    reward: mockRewardData.reward,
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(rewardData.reward.promoCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy promo code:", error);
    }
  };

  return (
    <RewardLayout businessName={rewardData.businessName}>
      <RewardContent copied={copied} onCopy={handleCopyCode} rewardData={rewardData} />
    </RewardLayout>
  );
}

export default RewardPage;
