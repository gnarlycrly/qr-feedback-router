import { useState, useEffect, type ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { Check, Gift, Copy } from "lucide-react";

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
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-purple-50">
      <header className="mx-auto max-w-6xl px-6 py-6">
        <div className="flex items-center justify-between rounded-2xl bg-white/70 backdrop-blur-md px-5 py-4 shadow-sm">
          <div className="flex items-center gap-4">
            {/* gradient badge */}
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-400 text-white shadow-sm">
              AB
            </div>
            <div>
              <p className="text-xl font-semibold tracking-tight text-slate-900">Absolutely Brilliant</p>
              <p className="text-sm text-slate-500">{businessName} · Customer Rewards</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700">Thank you!</span>
          </div>
        </div>
      </header>

      <main className="flex min-h-[60vh] items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">{children}</div>
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
    <div className="flex items-center gap-2" aria-label={`Rated ${rating} out of ${ratingScale}`}>
      {Array.from({ length: ratingScale }).map((_, index) => (
        <span
          key={index}
          aria-hidden="true"
          className={`flex h-7 w-7 items-center justify-center rounded-full text-sm ${
            index < rating ? "bg-yellow-400 text-white" : "bg-gray-200 text-gray-400"
          }`}
        >
          ★
        </span>
      ))}
      <span className="ml-2 text-sm text-slate-600">({rating}/{ratingScale})</span>
    </div>
  );

  return (
    <article className="relative overflow-hidden rounded-3xl bg-white shadow-md">
      {/* soft tinted header blob */}
      <div className="absolute -left-10 -top-10 h-40 w-40 rounded-full bg-gradient-to-br from-indigo-100 to-violet-100 opacity-70 blur-2xl pointer-events-none" />
      <div className="p-8">
        <section className="flex flex-col items-center gap-5 text-center">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-emerald-100 to-emerald-200 shadow-sm">
            <Check className="h-12 w-12 text-emerald-700" strokeWidth={2.5} />
          </div>

          <div>
            <h2 className="text-3xl font-extrabold text-slate-900">Thank you!</h2>
            <p className="mt-2 text-sm text-slate-500">Your feedback has been submitted successfully.</p>
          </div>
        </section>

        {rewardData.customerReview.rating > 0 && (
          <section className="mt-8 rounded-2xl bg-slate-50 p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-base font-semibold text-slate-900">Your Review</h3>
                {rewardData.customerReview.comment && (
                  <p className="mt-2 max-w-prose text-sm text-slate-600 italic">&ldquo;{rewardData.customerReview.comment}&rdquo;</p>
                )}
              </div>
              {renderStars(rewardData.customerReview.rating)}
            </div>
          </section>
        )}

        <p className="mt-6 text-center text-sm leading-relaxed text-slate-600">
          We truly appreciate you taking the time to share your experience with <span className="font-semibold text-slate-800">{rewardData.businessName}</span>. Enjoy this thank-you offer on us!
        </p>

        <section className="mt-8 rounded-2xl bg-gradient-to-br from-indigo-50 to-violet-50 p-6">
          <div className="flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-white shadow-sm">
              <Gift className="h-8 w-8 text-indigo-600" />
            </div>
          </div>

          <div className="mt-5 text-center">
            <h3 className="text-xl font-bold text-indigo-700">{rewardData.reward.title}</h3>
            <p className="mt-2 text-base text-slate-700">{rewardData.reward.description}</p>
          </div>

          <div className="mt-6 flex flex-col items-center gap-3">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-white px-6 py-3 text-center shadow-sm">
                <p className="text-lg font-semibold tracking-widest text-slate-900">{rewardData.reward.promoCode}</p>
              </div>

              <button
                type="button"
                onClick={onCopy}
                className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow hover:scale-105 active:scale-95 transition-transform duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-300"
                aria-label={copied ? "Promo code copied to clipboard" : "Copy promo code"}
              >
                {copied ? (
                  <Check className="h-5 w-5 text-emerald-600" />
                ) : (
                  <Copy className="h-5 w-5 text-indigo-600" />
                )}
              </button>
            </div>

            <span aria-live="polite" className="sr-only">{copied ? "Promo code copied to clipboard" : ""}</span>

            <p className="mt-2 text-center text-xs text-slate-500">{rewardData.reward.terms}</p>

            <div className="mt-4">
              <p className="text-center text-xs text-slate-500">Show this code at checkout</p>
            </div>
          </div>
        </section>

        <footer className="mt-8 text-center">
          <p className="text-sm text-slate-500">We look forward to serving you again soon!</p>
        </footer>
      </div>
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
