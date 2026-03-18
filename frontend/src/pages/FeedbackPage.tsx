import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";
import FeedbackForm from "../components/FeedbackForm";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

// Customer-facing feedback page. Submits navigate to the reward page by default.
export default function FeedbackPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const next = (location.state as { next?: string })?.next ?? "/reward";

  // Get businessId from URL query parameter
  const businessId = searchParams.get("business");

  // Check if this business is on the free plan (show watermark)
  const [showWatermark, setShowWatermark] = useState(false);
  useEffect(() => {
    if (!businessId) return;
    getDoc(doc(db, "businesses", businessId)).then((snap) => {
      if (snap.exists()) {
        const data = snap.data();
        const plan = data.subscription?.plan;
        setShowWatermark(plan !== "pro");
      } else {
        setShowWatermark(true);
      }
    }).catch(() => setShowWatermark(true));
  }, [businessId]);

  return (
    <div className="min-h-dvh bg-gradient-to-br from-blue-50 via-purple-50/30 to-blue-50 flex flex-col">
      {/* Back button – in normal document flow so it doesn't overlap content on small screens */}
      <div className="flex-shrink-0 px-4 pt-4 pb-2">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors px-3 py-2 rounded-lg hover:bg-white/80 -ml-1"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
      </div>

      <div className="flex-1 flex justify-center items-start px-4 py-4 pb-10">
        <FeedbackForm
          businessId={businessId || undefined}
          onSuccess={(feedbackData) => navigate(`${next}?fromFeedback=1&guest=1&business=${businessId || ''}`, {
            state: { fromFeedback: true, businessId, feedback: feedbackData }
          })}
        />
      </div>

      {showWatermark && (
        <div className="flex-shrink-0 pb-4 text-center">
          <p className="text-xs text-gray-400">
            Powered by <span className="font-semibold text-gray-500">StarBoard</span>
          </p>
        </div>
      )}
    </div>
  );
}
