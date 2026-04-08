import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { doc, getDoc, collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebaseConfig";
import RatingStars from "./RatingStars";
import type { SurveyQuestion } from "../firebaseHelpers/useBusinessData";

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
  customSurveyQuestions?: SurveyQuestion[];
  isPreviewMode?: boolean;
  onQuestionUpdate?: (id: string, question: string) => void;
  // optional path to navigate to after successful submit (e.g. reward page)
  successPath?: string;
  // optional callback to run after successful submit (preferred over successPath)
  onSuccess?: (feedbackData: { rating: number; comment: string }) => void;
}

export default function FeedbackForm({ customization, businessId, customSurveyQuestions = [], isPreviewMode = false, onQuestionUpdate, successPath, onSuccess }: FeedbackFormProps) {
  const [rating, setRating] = useState<number>(0);
  const [comments, setComments] = useState<string>("");
  const [surveyAnswers, setSurveyAnswers] = useState<Record<string, string | number | string[]>>({});
  const [effectiveCustomization, setEffectiveCustomization] = useState<FormCustomization | undefined>(customization);
  const [effectiveSurveyQuestions, setEffectiveSurveyQuestions] = useState<SurveyQuestion[]>(customSurveyQuestions);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (customization) {
      setEffectiveCustomization(customization);
    }
    if (customSurveyQuestions && customSurveyQuestions.length > 0) {
      setEffectiveSurveyQuestions(customSurveyQuestions);
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
              customer_submitButtonText: businessData.customer_submitButtonText || "Submit review",
            };
            setEffectiveCustomization(merged);
            
            // Load custom survey questions from business data
            if (businessData.customSurveyQuestions && businessData.customSurveyQuestions.length > 0) {
              setEffectiveSurveyQuestions(businessData.customSurveyQuestions);
            }
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
          customer_submitButtonText: fromForm?.submitButtonText || "Submit review",
        };

        setEffectiveCustomization(merged);
      } catch (e) {
        setEffectiveCustomization(undefined);
      }
    }
  }, [customization, businessId, customSurveyQuestions]);

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
          surveyAnswers,
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
      setSurveyAnswers({});

      // If parent provided an onSuccess callback, call it with feedback data. Otherwise navigate in-app to reward.
      if (onSuccess) {
        onSuccess(submittedFeedback);
        return;
      }

  const target = successPath ?? "/reward?fromFeedback=1&guest=1";
  // SPA navigation preserves routing state; include businessId and feedback so RewardPage can render the real submitted review.
  navigate(target, { state: { fromFeedback: true, businessId, feedback: submittedFeedback } });
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
            placeholder="Your feedback..."
            value={comments}
            onChange={isPreviewMode ? () => {} : (e) => setComments(e.target.value)}
            disabled={isPreviewMode}
          />
        </div>

        {/* Custom Survey Questions */}
        {effectiveSurveyQuestions && effectiveSurveyQuestions.length > 0 && effectiveSurveyQuestions.map((question) => (
          <div key={question.id} className="text-left">
            {isPreviewMode ? (
              <input
                type="text"
                value={question.question}
                onChange={(e) => onQuestionUpdate?.(question.id, e.target.value)}
                className="block w-full text-sm font-semibold text-gray-700 mb-3 px-2 py-1 border border-transparent hover:border-gray-300 focus:border-blue-500 rounded transition-colors bg-transparent"
                placeholder="Click to edit question..."
              />
            ) : (
              question.question && (
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  {question.question}
                </label>
              )
            )}
            {question.type === "rating" ? (
              <div className="flex justify-center">
                <RatingStars 
                  value={surveyAnswers[question.id] as number || 0} 
                  onChange={isPreviewMode ? () => {} : (val) => setSurveyAnswers({...surveyAnswers, [question.id]: val})} 
                />
              </div>
            ) : question.type === "checkbox" ? (
              <div className="space-y-2">
                {question.options?.map((option, index) => (
                  <label key={index} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={Array.isArray(surveyAnswers[question.id]) ? (surveyAnswers[question.id] as string[]).includes(option) : false}
                      onChange={isPreviewMode ? () => {} : (e) => {
                        const currentVal = surveyAnswers[question.id];
                        const current = Array.isArray(currentVal) ? currentVal.slice() : [];
                        const updated = e.target.checked
                          ? [...current, option]
                          : current.filter(v => v !== option);
                        setSurveyAnswers({...surveyAnswers, [question.id]: updated});
                      }}
                      disabled={isPreviewMode}
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                    <span className="text-sm text-gray-700">{option}</span>
                  </label>
                ))}
              </div>
            ) : (
              <textarea
                className="w-full rounded-xl border-2 border-gray-200 bg-gray-50 text-gray-800 text-base p-4 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 focus:bg-white min-h-[100px] transition-all duration-200 resize-none"
                placeholder="Your answer..."
                value={surveyAnswers[question.id] as string || ""}
                onChange={isPreviewMode ? () => {} : (e) => setSurveyAnswers({...surveyAnswers, [question.id]: e.target.value})}
                disabled={isPreviewMode}
              />
            )}
          </div>
        ))}

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
