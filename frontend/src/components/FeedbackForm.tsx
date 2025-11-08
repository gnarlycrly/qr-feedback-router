import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import RatingStars from "./RatingStars";

type FormCustomization = {
  businessName: string;
  primaryColor: string;
  accentColor: string;
  headerText: string;
  ratingPrompt: string;
  feedbackPrompt: string;
  submitButtonText: string;
};

interface FeedbackFormProps {
  customization?: FormCustomization;
  // optional path to navigate to after successful submit (e.g. reward page)
  successPath?: string;
  // optional callback to run after successful submit (preferred over successPath)
  onSuccess?: () => void;
}

export default function FeedbackForm({ customization, successPath, onSuccess }: FeedbackFormProps) {
  const [rating, setRating] = useState<number>(0);
  const [comments, setComments] = useState<string>("");
  const [effectiveCustomization, setEffectiveCustomization] = useState<FormCustomization | undefined>(customization);
  const navigate = useNavigate();

  useEffect(() => {
    if (customization) {
      setEffectiveCustomization(customization);
      return;
    }

    try {
      const raw = localStorage.getItem("ab_form_settings");
      const businessRaw = localStorage.getItem("ab_business");
      const themeRaw = localStorage.getItem("ab_theme");
      const fromForm = raw ? JSON.parse(raw) : undefined;
      const business = businessRaw ? JSON.parse(businessRaw) : undefined;
      const theme = themeRaw ? JSON.parse(themeRaw) : undefined;

      const merged: FormCustomization = {
        businessName: business?.businessName || fromForm?.businessName || "Sample Business",
        primaryColor: theme?.appPrimary || fromForm?.primaryColor || "#1A3673",
        accentColor: theme?.appAccent || fromForm?.accentColor || "#2563eb",
        headerText: fromForm?.headerText || "How was your experience?",
        ratingPrompt: fromForm?.ratingPrompt || "Rate your experience",
        feedbackPrompt: fromForm?.feedbackPrompt || "Tell us more about your experience (optional)",
        submitButtonText: fromForm?.submitButtonText || "Submit Review",
      };

      setEffectiveCustomization(merged);
    } catch (e) {
      setEffectiveCustomization(undefined);
    }
  }, [customization]);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const payload = {
      businessName: (effectiveCustomization?.businessName) || customization?.businessName || "Sample Business",
      rating,
      comments,
    };

    console.log("submit:", payload);

    // reset form (you can remove this if you don't want auto clear)
    setRating(0);
    setComments("");

    // If parent provided an onSuccess callback, call it. Otherwise navigate in-app to reward.
    if (onSuccess) {
      onSuccess();
      return;
    }

    const target = successPath ?? "/reward?fromFeedback=1&guest=1";
    // SPA navigation preserves routing state; include location state so RewardPage knows it came from feedback.
    navigate(target, { state: { fromFeedback: true } });
  }

  return (
    <div className="w-full max-w-md bg-white rounded-lg shadow-[0_15px_25px_rgba(0,0,0,0.08)] border border-gray-200 p-6">
      <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
        {/* Header */}
        <div className="text-center">
          <h1 style={{ color: effectiveCustomization?.primaryColor }} className="font-medium text-lg">
            {effectiveCustomization?.businessName || customization?.businessName || "Sample Business"}
          </h1>
          <p className="text-gray-600 text-sm mt-2">
            {effectiveCustomization?.headerText || customization?.headerText || "How was your experience?"}
          </p>
        </div>

        {/* Stars */}
        <div className="flex flex-col items-center text-center">
          <RatingStars value={rating} onChange={setRating} />
          <p className="text-gray-700 text-sm mt-3">
            {effectiveCustomization?.ratingPrompt || customization?.ratingPrompt || "Rate your experience"}
          </p>
        </div>

        {/* Text area */}
        <div className="text-left">
          <label
            htmlFor="comments"
            className="block text-sm font-semibold text-gray-800 mb-2"
          >
            {effectiveCustomization?.feedbackPrompt || customization?.feedbackPrompt || "Tell us more about your experience (optional)"}
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
          style={{ backgroundColor: effectiveCustomization?.accentColor || 'var(--app-accent)' }}
          className="w-full rounded-md text-white text-sm font-medium py-3 text-center shadow-sm hover:opacity-90 active:scale-[.99] transition"
        >
          {effectiveCustomization?.submitButtonText || customization?.submitButtonText || "Submit Review"}
        </button>
      </form>
    </div>
  );
}
