import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { doc, getDoc, collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebaseConfig";
import RatingStars from "./RatingStars";

type FormCustomization = {
  customer_businessName: string;
  customer_primaryColor: string;
  customer_accentColor: string;
  customer_headerText: string;
  customer_ratingPrompt: string;
  customer_feedbackPrompt: string;
  customer_feedbackPlaceholder: string;
  customer_submitButtonText: string;
};

interface FeedbackFormProps {
  customization?: FormCustomization;
  businessId?: string;
  isPreviewMode?: boolean;
  // optional path to navigate to after successful submit (e.g. reward page)
  successPath?: string;
  // optional callback to run after successful submit (preferred over successPath)
  onSuccess?: (result: FeedbackSubmitResult) => void;
}

const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export type FeedbackSnapshot = {
  rating: number;
  comment: string;
};

export type FeedbackSubmitResult = {
  feedback: FeedbackSnapshot;
  businessId: string | null;
  issuedRewardId: string | null;
  issuedRewardCode: string | null;
};

const generateRewardCode = () => {
  const part = () =>
    Array.from({ length: 4 }, () => CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)]).join("");
  return `${part()}-${part()}`;
};

export default function FeedbackForm({ customization, businessId, isPreviewMode = false, successPath, onSuccess }: FeedbackFormProps) {
  const [rating, setRating] = useState<number>(0);
  const [comments, setComments] = useState<string>("");
  const [effectiveCustomization, setEffectiveCustomization] = useState<FormCustomization | undefined>(customization);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (customization) {
      setEffectiveCustomization(customization);
    }

    // If businessId is provided, fetch business data from Firestore
    if (businessId) {
      const loadBusinessData = async () => {
        try {
          const businessDoc = await getDoc(doc(db, "businesses", businessId));
          if (businessDoc.exists()) {
            const businessData = businessDoc.data();
            const merged: FormCustomization = {
              customer_businessName: businessData.customer_businessName || "Sample Business",
              customer_primaryColor: businessData.customer_primaryColor || "#1A3673",
              customer_accentColor: businessData.customer_accentColor || "#2563eb",
              customer_headerText: businessData.customer_headerText || "How was your experience?",
              customer_ratingPrompt: businessData.customer_ratingPrompt || "Rate your experience",
              customer_feedbackPrompt: businessData.customer_feedbackPrompt || "Tell us more about your experience (optional)",
              customer_feedbackPlaceholder: businessData.customer_feedbackPlaceholder || "Your feedback...",
              customer_submitButtonText: businessData.customer_submitButtonText || "Submit review",
            };
            setEffectiveCustomization(merged);
            return;
          }
        } catch (e) {
          console.error("Error loading business data:", e);
        }
      };
      loadBusinessData();
      return;
    }

    // Fallback to localStorage for preview mode
    if (!customization) {
      try {
        const raw = localStorage.getItem("ab_form_settings");
        const businessRaw = localStorage.getItem("ab_business");
        const themeRaw = localStorage.getItem("ab_theme");
        const fromForm = raw ? JSON.parse(raw) : undefined;
        const business = businessRaw ? JSON.parse(businessRaw) : undefined;
        const theme = themeRaw ? JSON.parse(themeRaw) : undefined;

        const merged: FormCustomization = {
          customer_businessName: business?.businessName || fromForm?.businessName || "Sample Business",
          customer_primaryColor: theme?.appPrimary || fromForm?.primaryColor || "#1A3673",
          customer_accentColor: theme?.appAccent || fromForm?.accentColor || "#2563eb",
          customer_headerText: fromForm?.headerText || "How was your experience?",
          customer_ratingPrompt: fromForm?.ratingPrompt || "Rate your experience",
          customer_feedbackPrompt: fromForm?.feedbackPrompt || "Tell us more about your experience (optional)",
          customer_feedbackPlaceholder: fromForm?.feedbackPlaceholder || "Your feedback...",
          customer_submitButtonText: fromForm?.submitButtonText || "Submit review",
        };

        setEffectiveCustomization(merged);
      } catch (e) {
        setEffectiveCustomization(undefined);
      }
    }
  }, [customization, businessId]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (loading) return; // Prevent double submission
    if (rating === 0) {
      alert("Please select a star rating before submitting.");
      return;
    }
    setLoading(true);

    try {
      // Save feedback to Firestore if businessId is provided
      let issuedRewardId: string | null = null;
      let issuedRewardCode: string | null = null;

      if (businessId) {
        const feedbackRef = await addDoc(collection(db, "feedback"), {
          businessId,
          businessName: effectiveCustomization?.customer_businessName || "Sample Business",
          rating,
          comments,
          createdAt: serverTimestamp(),
        });

        // Reward issuance is best-effort and should never block feedback submission.
        try {
          let rewardTitle = "No active reward";
          let rewardDescription: string | null = null;
          try {
            const businessSnap = await getDoc(doc(db, "businesses", businessId));
            if (businessSnap.exists()) {
              const data = businessSnap.data();
              const rewards: any[] = Array.isArray(data.rewards) ? data.rewards : [];
              const active = rewards.find((r: any) => r?.active);
              if (active) {
                const title = typeof active.title === "string" ? active.title.trim() : "";
                rewardTitle = title || "";
                const desc = active.value ?? active.description;
                rewardDescription =
                  typeof desc === "string" && desc.trim() ? desc.trim() : null;
              }
            }
          } catch (snapshotError) {
            console.error("Could not load business for reward snapshot:", snapshotError);
          }

          issuedRewardCode = generateRewardCode();
          const issuedRef = await addDoc(collection(db, "issuedRewards"), {
            businessId,
            feedbackId: feedbackRef.id,
            code: issuedRewardCode,
            status: "issued",
            issuedAt: serverTimestamp(),
            redeemedAt: null,
            redeemedBy: null,
            rewardTitle,
            rewardDescription,
          });
          issuedRewardId = issuedRef.id;
        } catch (rewardError) {
          console.error("Reward issuance failed (feedback still submitted):", rewardError);
          issuedRewardCode = null;
          issuedRewardId = null;
        }

        console.log("Feedback saved to Firestore");
      } else {
        // Just log for preview mode
        const payload = {
          businessName: (effectiveCustomization?.customer_businessName) || customization?.customer_businessName || "Sample Business",
          rating,
          comments,
        };
        console.log("submit:", payload);
      }

      // Create feedback data object to pass to parent
      const submittedFeedback: FeedbackSnapshot = {
        rating,
        comment: comments,
      };

      // reset form (you can remove this if you don't want auto clear)
      setRating(0);
      setComments("");

      // If parent provided an onSuccess callback, call it with feedback data. Otherwise navigate in-app to reward.
      if (onSuccess) {
        onSuccess({
          feedback: submittedFeedback,
          businessId: businessId ?? null,
          issuedRewardId,
          issuedRewardCode,
        });
        return;
      }

      const target = successPath ?? "/reward?fromFeedback=1&guest=1";
      // SPA navigation preserves routing state; include businessId, feedback, and issued reward metadata for the thank-you page.
      const targetWithRewardId = issuedRewardId
        ? `${target}${target.includes("?") ? "&" : "?"}rid=${issuedRewardId}`
        : target;
      navigate(targetWithRewardId, {
        state: {
          fromFeedback: true,
          businessId,
          feedback: submittedFeedback,
          issuedRewardId,
          issuedRewardCode,
        },
      });
    } catch (error) {
      console.error("Error submitting feedback:", error);
      alert("Failed to submit feedback. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <article className="relative overflow-hidden rounded-3xl bg-white shadow-md w-full max-w-md p-5 sm:p-8">
      {/* Business Name and Header Text */}
      {!isPreviewMode && (
        <div className="text-center pb-4 mb-6 border-b border-gray-100">
          <h1
            style={{ color: effectiveCustomization?.customer_primaryColor }}
            className="text-3xl font-extrabold mb-2 text-slate-900"
          >
            {effectiveCustomization?.customer_businessName}
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            {effectiveCustomization?.customer_headerText}
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col space-y-6">
        {/* Main Rating */}
        <div className="text-center">
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            {effectiveCustomization?.customer_ratingPrompt || "Rate your experience"}
          </label>
          <RatingStars value={rating} onChange={isPreviewMode ? () => {} : setRating} />
        </div>

        {/* Comments */}
        <div className="text-left">
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            {effectiveCustomization?.customer_feedbackPrompt || "Tell us more about your experience (optional)"}
          </label>
          <textarea
            className="w-full rounded-xl border-2 border-gray-200 bg-gray-50 text-gray-800 text-base p-4 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 focus:bg-white min-h-[100px] transition-all duration-200 resize-none"
            placeholder={effectiveCustomization?.customer_feedbackPlaceholder || "Your feedback..."}
            value={comments}
            onChange={isPreviewMode ? () => {} : (e) => setComments(e.target.value)}
            disabled={isPreviewMode}
          />
        </div>

        {/* Submit button */}
        <button
          type="submit"
          disabled={isPreviewMode || loading || rating === 0}
          style={{ 
            backgroundColor: effectiveCustomization?.customer_accentColor || 'var(--app-accent)',
            opacity: isPreviewMode || loading || rating === 0 ? 0.6 : 1
          }}
          className="w-full rounded-xl text-white text-base font-semibold py-4 text-center shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          {loading 
            ? "Submitting..." 
            : (effectiveCustomization?.customer_submitButtonText || "Submit review")
          }
        </button>
      </form>
    </article>
  );
}
