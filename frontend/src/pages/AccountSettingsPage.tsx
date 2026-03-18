import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CreditCard, Sparkles, ArrowLeft } from "lucide-react";
import { useSubscription } from "../firebaseHelpers/useSubscription";
import { auth } from "../firebaseConfig";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function AccountSettingsPage() {
  const navigate = useNavigate();
  const { plan, status, isPro, cancelAtPeriodEnd, currentPeriodEnd, isLoading } = useSubscription();
  const [portalLoading, setPortalLoading] = useState(false);

  const handleManageBilling = async () => {
    setPortalLoading(true);
    try {
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch(`${API_URL}/api/stripe/create-portal-session`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || "Failed to open billing portal");
      }
    } catch (err) {
      console.error("Portal error:", err);
      alert("Something went wrong.");
    } finally {
      setPortalLoading(false);
    }
  };

  const formatDate = (ts: number | null) => {
    if (!ts) return "N/A";
    return new Date(ts * 1000).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const statusLabel: Record<string, string> = {
    free: "Free",
    active: "Active",
    trialing: "Trial",
    past_due: "Past Due",
    canceled: "Canceled",
  };

  const statusColor: Record<string, string> = {
    free: "bg-gray-100 text-gray-700",
    active: "bg-green-100 text-green-700",
    trialing: "bg-blue-100 text-blue-700",
    past_due: "bg-red-100 text-red-700",
    canceled: "bg-gray-100 text-gray-600",
  };

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-8 space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <button onClick={() => navigate("/portal")} className="p-2 rounded-lg hover:bg-gray-100 transition">
          <ArrowLeft size={20} className="text-gray-600" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Account & Billing</h1>
      </div>

      {/* Current plan */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Current Plan</p>
            <div className="flex items-center gap-3 mt-1">
              <h2 className="text-2xl font-bold text-gray-900">
                {plan === "pro" ? "StarBoard Pro" : "StarBoard Free"}
              </h2>
              <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${statusColor[status] || statusColor.free}`}>
                {statusLabel[status] || status}
              </span>
            </div>
          </div>
          {isPro && (
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#F2C125] to-[#FF8C1A]">
              <Sparkles size={24} className="text-white" />
            </div>
          )}
        </div>

        {isPro && currentPeriodEnd && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-sm text-gray-600">
              {cancelAtPeriodEnd
                ? `Your subscription will end on ${formatDate(currentPeriodEnd)}`
                : `Next billing date: ${formatDate(currentPeriodEnd)}`}
            </p>
          </div>
        )}

        {status === "past_due" && (
          <div className="mt-4 p-3 bg-red-50 rounded-lg">
            <p className="text-sm text-red-700 font-medium">
              Your payment is past due. Please update your payment method to keep Pro features.
            </p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 space-y-3">
        {isPro ? (
          <button
            onClick={handleManageBilling}
            disabled={portalLoading}
            className="flex items-center gap-2 w-full px-5 py-3 bg-gray-900 text-white font-semibold rounded-lg hover:bg-gray-800 transition disabled:opacity-50"
          >
            <CreditCard size={18} />
            {portalLoading ? "Opening..." : "Manage Subscription"}
          </button>
        ) : (
          <button
            onClick={() => navigate("/pricing")}
            className="flex items-center gap-2 w-full px-5 py-3 bg-gradient-to-r from-[#F2C125] to-[#FF8C1A] text-white font-semibold rounded-lg hover:opacity-90 transition"
          >
            <Sparkles size={18} />
            Upgrade to Pro
          </button>
        )}
      </div>
    </div>
  );
}
