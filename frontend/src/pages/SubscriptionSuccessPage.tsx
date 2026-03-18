import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, Sparkles } from "lucide-react";
import { useSubscription } from "../firebaseHelpers/useSubscription";

export default function SubscriptionSuccessPage() {
  const navigate = useNavigate();
  const { isPro, isLoading } = useSubscription();
  const [waited, setWaited] = useState(false);

  // Give Firestore a moment to sync from the webhook
  useEffect(() => {
    const timer = setTimeout(() => setWaited(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  const synced = waited && !isLoading && isPro;

  return (
    <div className="min-h-screen bg-[#ffb133] flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl p-10 shadow-2xl max-w-md w-full text-center">
        {synced ? (
          <>
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-green-400 to-green-600 mb-6">
              <Check className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome to Pro!</h1>
            <p className="text-gray-600 mb-6">
              Your subscription is active. All Pro features are now unlocked.
            </p>
            <button
              onClick={() => navigate("/portal")}
              className="w-full px-6 py-3 bg-gradient-to-r from-[#F2C125] to-[#FF8C1A] text-white font-semibold rounded-lg hover:opacity-90 transition"
            >
              Go to Portal
            </button>
          </>
        ) : (
          <>
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#F2C125] to-[#FF8C1A] mb-6 animate-pulse">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Setting up your account...</h1>
            <p className="text-gray-600">This usually takes just a few seconds.</p>
            <div className="mt-6 flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#F2C125]" />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
