import FeedbackForm from "../components/FeedbackForm";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";

// Customer-facing feedback page. Submits navigate to the reward page by default.
export default function FeedbackPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const next = (location.state as { next?: string })?.next ?? "/reward";

  // Get businessId from URL query parameter
  const businessId = searchParams.get("business");

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50/30 to-blue-50 px-4 py-12 relative">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="absolute top-6 left-6 flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors px-4 py-2 rounded-lg hover:bg-white/80"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back
      </button>

      <FeedbackForm
        businessId={businessId || undefined}
        onSuccess={(feedbackData) => navigate(`${next}?fromFeedback=1&guest=1&business=${businessId || ''}`, {
          state: { fromFeedback: true, businessId, feedback: feedbackData }
        })}
      />
    </div>
  );
}
