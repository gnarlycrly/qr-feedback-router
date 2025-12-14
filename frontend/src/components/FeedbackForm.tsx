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
  customer_submitButtonText: string;
};

interface FeedbackFormProps {
  customization?: FormCustomization;
  businessId?: string;
  // optional path to navigate to after successful submit (e.g. reward page)
  successPath?: string;
  // optional callback to run after successful submit (preferred over successPath)
  onSuccess?: (feedbackData: { rating: number; comment: string }) => void;
}

export default function FeedbackForm({ customization, businessId, successPath, onSuccess }: FeedbackFormProps) {
  const [rating, setRating] = useState<number>(0);
  const [comments, setComments] = useState<string>("");
  const [effectiveCustomization, setEffectiveCustomization] = useState<FormCustomization | undefined>(customization);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (customization) {
      setEffectiveCustomization(customization);
      return;
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
              customer_ratingPrompt: businessData.customer_ratingPrompt|| "Rate your experience",
              customer_feedbackPrompt: businessData.customer_feedbackPrompt || "Tell us more about your experience (optional)",
              customer_submitButtonText: businessData.customer_submitButtonText || "Submit Review",
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
        customer_submitButtonText: fromForm?.submitButtonText || "Submit Review",
      };

      setEffectiveCustomization(merged);
    } catch (e) {
      setEffectiveCustomization(undefined);
    }
  }, [customization, businessId]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (loading) return; // Prevent double submission
    setLoading(true);

    try {
      // Save feedback to Firestore if businessId is provided
      if (businessId) {
        await addDoc(collection(db, "feedback"), {
          businessId,
          businessName: effectiveCustomization?.customer_businessName || "Sample Business",
          rating,
          comments,
          createdAt: serverTimestamp(),
        });
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
      const submittedFeedback = {
        rating,
        comment: comments,
      };

      // reset form (you can remove this if you don't want auto clear)
      setRating(0);
      setComments("");

      // If parent provided an onSuccess callback, call it with feedback data. Otherwise navigate in-app to reward.
      if (onSuccess) {
        onSuccess(submittedFeedback);
        return;
      }

      const target = successPath ?? "/reward?fromFeedback=1&guest=1";
      // SPA navigation preserves routing state; include location state so RewardPage knows it came from feedback.
      navigate(target, { state: { fromFeedback: true, feedback: submittedFeedback } });
    } catch (error) {
      console.error("Error submitting feedback:", error);
      alert("Failed to submit feedback. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-100 p-8">
      <form onSubmit={handleSubmit} className="flex flex-col space-y-6">
        {/* Header */}
        <div className="text-center pb-4 border-b border-gray-100">
          <h1 
            style={{ color: effectiveCustomization?.customer_primaryColor || '#2563eb' }} 
            className="font-bold text-2xl mb-2"
          >
            {effectiveCustomization?.customer_businessName || customization?.customer_businessName || "Sample Business"}
          </h1>
          <p className="text-gray-600 text-base">
            {effectiveCustomization?.customer_headerText || customization?.customer_headerText || "How was your experience?"}
          </p>
        </div>

        {/* Stars */}
        <div className="flex flex-col items-center text-center py-4">
          <RatingStars value={rating} onChange={setRating} />
          <p className="text-gray-700 text-base mt-4 font-medium">
            {effectiveCustomization?.customer_ratingPrompt || customization?.customer_ratingPrompt || "Rate your experience"}
          </p>
        </div>

        {/* Text area */}
        <div className="text-left">
          <label
            htmlFor="comments"
            className="block text-sm font-semibold text-gray-700 mb-3"
          >
            {effectiveCustomization?.customer_feedbackPrompt || customization?.customer_feedbackPrompt || "Tell us more about your experience (optional)"}
          </label>

          <textarea
            id="comments"
            className="w-full rounded-xl border-2 border-gray-200 bg-gray-50 text-gray-800 text-base p-4 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 focus:bg-white min-h-[120px] transition-all duration-200 resize-none"
            placeholder="What did you like most? Any suggestions for improvement?"
            value={comments}
            onChange={(e) => setComments(e.target.value)}
          />
        </div>

        {/* Submit button */}
        <button
          type="submit"
          disabled={loading || rating === 0}
          style={{ 
            backgroundColor: effectiveCustomization?.customer_accentColor || 'var(--app-accent)',
            opacity: loading || rating === 0 ? 0.6 : 1
          }}
          className="w-full rounded-xl text-white text-base font-semibold py-4 text-center shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          {loading 
            ? "Submitting..." 
            : (effectiveCustomization?.customer_submitButtonText || customization?.customer_submitButtonText || "Submit Review")
          }
        </button>
      </form>
    </div>
  );
}
