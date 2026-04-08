import { useState, useEffect, type ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
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
    promoCode?: string;
    validityDays?: number;
    terms?: string;
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
  showHeader = true,
}: {
  businessName: string;
  children: ReactNode;
  showHeader?: boolean;
}) => {
  return (
  <div className="min-h-dvh bg-linear-to-b from-indigo-50 to-purple-50">
      {showHeader && (
        <header className="mx-auto max-w-6xl px-4 sm:px-6 py-4 sm:py-6">
          <div className="flex items-center justify-between rounded-2xl bg-white/70 backdrop-blur-md px-4 sm:px-5 py-3 sm:py-4 shadow-sm min-w-0">
            <div className="flex items-center gap-3 sm:gap-4 min-w-0">
              <div className="min-w-0">
                <p className="text-base sm:text-xl font-semibold tracking-tight text-slate-900 truncate">Business Portal</p>
                <p className="text-xs sm:text-sm text-slate-500 truncate">{businessName} · Customer Rewards</p>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              <span className="rounded-full bg-emerald-100 px-2 sm:px-3 py-1 text-xs font-medium text-emerald-700">Thank you!</span>
            </div>
          </div>
        </header>
      )}

      <main className="flex min-h-[60vh] items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">{children}</div>
      </main>
    </div>
  );
};

const RewardContent = ({
  copied,
  onCopy,
  onRevealRedeem,
  showRedeemPanel,
  onRedeem,
  redeeming,
  redeemed,
  codeToShow,
  rewardData,
  primaryColor,
}: {
  copied: boolean;
  onCopy: () => Promise<void>;
  onRevealRedeem: () => void;
  showRedeemPanel: boolean;
  onRedeem: () => Promise<void>;
  redeeming: boolean;
  redeemed: boolean;
  codeToShow?: string;
  rewardData: RewardDetails;
  primaryColor?: string;
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
  <div className="absolute -left-10 -top-10 h-40 w-40 rounded-full bg-linear-to-br from-indigo-100 to-violet-100 opacity-70 blur-2xl pointer-events-none" />
      <div className="p-5 sm:p-8">
        <section className="flex flex-col items-center gap-5 text-center">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-linear-to-br from-emerald-100 to-emerald-200 shadow-sm">
            <Check className="h-12 w-12 text-emerald-700" strokeWidth={2.5} />
          </div>

          <div>
            <h2 style={{ color: primaryColor || '#10b981' }} className="text-3xl font-extrabold">Thank you!</h2>
            <p className="mt-2 text-sm text-slate-500">Your feedback has been submitted successfully.</p>
          </div>
        </section>

        {rewardData.customerReview.rating > 0 && (
          <section className="mt-8 rounded-2xl bg-slate-50 p-4">
            <div className="flex flex-wrap items-start justify-between gap-4">
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

  <section className="mt-8 rounded-2xl bg-linear-to-br from-indigo-50 to-violet-50 p-6">
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
            {codeToShow ? (
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-white px-6 py-3 text-center shadow-sm">
                  <p className="text-lg font-semibold tracking-widest text-slate-900">{codeToShow}</p>
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
            ) : (
              <div className="rounded-lg bg-white px-4 py-3 text-center shadow-sm">
                <p className="text-sm font-medium text-slate-700">Reward code unavailable right now</p>
                <p className="mt-1 text-xs text-slate-500">Please ask staff for help.</p>
              </div>
            )}

              <span aria-live="polite" className="sr-only">{copied ? "Promo code copied to clipboard" : ""}</span>

              <p className="mt-2 text-center text-xs text-slate-500">{rewardData.reward.terms}</p>

              <div className="mt-4">
                <p className="text-center text-xs text-slate-500">Show this code at checkout</p>
              </div>

              <div className="mt-3 w-full max-w-xs space-y-2">
                <button
                  type="button"
                  onClick={onRevealRedeem}
                  className="w-full rounded-lg bg-linear-to-r from-[#F2C125] to-[#FF8C1A] px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
                >
                  Show to employee to redeem reward
                </button>

                {showRedeemPanel && (
                  <button
                    type="button"
                    onClick={() => void onRedeem()}
                    disabled={redeemed || redeeming || !codeToShow}
                    className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {redeemed ? "Reward redeemed" : redeeming ? "Redeeming..." : "Employee: Confirm redeem"}
                  </button>
                )}
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
  const [liveReward, setLiveReward] = useState<RewardDetails["reward"] | null>(null);
  const [primaryColor, setPrimaryColor] = useState<string | undefined>(undefined);
  const [issuedRewardId, setIssuedRewardId] = useState<string | null>(null);
  const [issuedRewardCode, setIssuedRewardCode] = useState<string | null>(null);
  const [showRedeemPanel, setShowRedeemPanel] = useState(false);
  const [redeeming, setRedeeming] = useState(false);
  const [redeemed, setRedeemed] = useState(false);
  const location = useLocation();

  const search = new URLSearchParams(location.search);
  const rewardIdFromQuery = search.get("rid");
  const isCustomer = search.get("guest") === "1" || search.get("fromFeedback") === "1" || ((location.state as any)?.fromFeedback ?? false);

  // Get feedback data and business info from navigation state
  // If no feedback.comment was provided, keep comment empty (do not show a default example comment)
  const feedbackData = (location.state as any)?.feedback || {
    rating: mockRewardData.customerReview.rating,
    comment: "",
  };

  const businessId = (location.state as any)?.businessId;

  useEffect(() => {
    const state = location.state as any;
    if (state?.issuedRewardId) {
      setIssuedRewardId(state.issuedRewardId);
    } else if (rewardIdFromQuery) {
      setIssuedRewardId(rewardIdFromQuery);
    }
    if (state?.issuedRewardCode) {
      setIssuedRewardCode(state.issuedRewardCode);
    }
  }, [location.state, rewardIdFromQuery]);

  useEffect(() => {
    const loadIssuedRewardState = async () => {
      if (!issuedRewardId) return;
      try {
        const snap = await getDoc(doc(db, "issuedRewards", issuedRewardId));
        if (snap.exists()) {
          const data = snap.data() as { status?: string; code?: string };
          if (data.code && !issuedRewardCode) {
            setIssuedRewardCode(data.code);
          }
          setRedeemed(data.status === "redeemed");
        }
      } catch (error) {
        console.error("Failed loading issued reward status:", error);
      }
    };

    loadIssuedRewardState();
  }, [issuedRewardId, issuedRewardCode]);

  // Load business data from Firestore if businessId is provided
  useEffect(() => {
    const loadBusinessData = async () => {
      if (businessId) {
        try {
          const businessDoc = await getDoc(doc(db, "businesses", businessId));
          if (businessDoc.exists()) {
            const data = businessDoc.data();
            setBusinessName(data.name || mockRewardData.businessName);
            setPrimaryColor((data as any).customer_primaryColor || undefined);

            // Find an active reward
            const rewards: any[] = data.rewards || [];
            const activeReward = rewards.find((r: any) => r.active);

            if (activeReward) {
              setLiveReward({
                title: activeReward.title,
                description: activeReward.value || activeReward.description,
                promoCode: activeReward.promoCode,
                validityDays: 30,
                terms: `Valid for 30 days. Max ${activeReward.maxRedemptions} redemptions.`,
              });
            }
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
      rating: feedbackData.rating ?? mockRewardData.customerReview.rating,
      comment: feedbackData.comment ?? "",
    },
    businessName: businessName,
    reward: {
      ...(liveReward ?? mockRewardData.reward),
      promoCode: isCustomer ? (issuedRewardCode ?? undefined) : (issuedRewardCode ?? (liveReward ?? mockRewardData.reward).promoCode),
      terms: redeemed
        ? "This reward has been redeemed."
        : (liveReward ?? mockRewardData.reward).terms,
    },
  };

  const handleCopyCode = async () => {
    try {
      const code = issuedRewardCode ?? (isCustomer ? undefined : rewardData.reward.promoCode);
      if (!code) return;
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy promo code:", error);
    }
  };

  const codeToShow = issuedRewardCode ?? (isCustomer ? undefined : rewardData.reward.promoCode);

  const handleRedeem = async () => {
    if (!issuedRewardId || redeemed || redeeming) return;
    const confirmed = window.confirm("Confirm reward redemption?");
    if (!confirmed) return;
    setRedeeming(true);
    try {
      await updateDoc(doc(db, "issuedRewards", issuedRewardId), {
        status: "redeemed",
        redeemedAt: serverTimestamp(),
      });
      setRedeemed(true);
    } catch (error) {
      console.error("Failed to redeem reward:", error);
      alert("Failed to redeem reward. Please try again.");
    } finally {
      setRedeeming(false);
    }
  };

  return (
    <RewardLayout businessName={rewardData.businessName} showHeader={!isCustomer}>
      <RewardContent
        copied={copied}
        onCopy={handleCopyCode}
        onRevealRedeem={() => setShowRedeemPanel(true)}
        showRedeemPanel={showRedeemPanel}
        onRedeem={handleRedeem}
        redeeming={redeeming}
        redeemed={redeemed}
        codeToShow={codeToShow}
        rewardData={rewardData}
        primaryColor={primaryColor}
      />
    </RewardLayout>
  );
}

export default RewardPage;
