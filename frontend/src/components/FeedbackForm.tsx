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
    <div className="w-full max-w-md bg-white rounded-lg shadow-[0_15px_25px_rgba(0,0,0,0.08)] border border-gray-200 p-6">
      <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
        {/* Header */}
        <div className="text-center">
          <h1 style={{ color: effectiveCustomization?.customer_primaryColor }} className="font-medium text-lg">
            {effectiveCustomization?.customer_businessName || customization?.customer_businessName || "Sample Business"}
          </h1>
          <p className="text-gray-600 text-sm mt-2">
            {effectiveCustomization?.customer_headerText || customization?.customer_headerText || "How was your experience?"}
          </p>
        </div>

        {/* Stars */}
        <div className="flex flex-col items-center text-center">
          <RatingStars value={rating} onChange={setRating} />
          <p className="text-gray-700 text-sm mt-3">
            {effectiveCustomization?.customer_ratingPrompt || customization?.customer_ratingPrompt || "Rate your experience"}
          </p>
        </div>

        {/* Text area */}
        <div className="text-left">
          <label
            htmlFor="comments"
            className="block text-sm font-semibold text-gray-800 mb-2"
          >
            {effectiveCustomization?.customer_feedbackPrompt || customization?.customer_feedbackPrompt || "Tell us more about your experience (optional)"}
          </label>

          <textarea
            id="comments"
            className="w-full rounded-md border border-gray-300 bg-gray-100 text-gray-800 text-sm p-3 outline-none focus:ring-2 focus:ring-indigo-400 focus:bg-white min-h-[90px]"
            placeholder="What did you like most? Any suggestions for improvement?"
            value={comments}
            onChange={(e) => setComments(e.target.value)}
          />
        </div>

        {/* Submit button */}
        <button
          type="submit"
          disabled={loading}
          style={{ backgroundColor: effectiveCustomization?.customer_accentColor || 'var(--app-accent)' }}
          className="w-full rounded-md text-white text-sm font-medium py-3 text-center shadow-sm hover:opacity-90 active:scale-[.99] transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Submitting..." : (effectiveCustomization?.customer_submitButtonText || customization?.customer_submitButtonText || "Submit Review")}
        </button>
      </form>
    </div>
  );
}
