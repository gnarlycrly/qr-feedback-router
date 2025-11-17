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
    <div className="min-h-screen flex items-center justify-center bg-app-gradient px-4 py-8 relative">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="absolute top-4 left-4 text-sm text-indigo-600 hover:underline"
      >
        ← Back
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
