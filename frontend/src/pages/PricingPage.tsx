import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, X, Sparkles } from "lucide-react";
import { useAuth } from "../firebaseHelpers/AuthContext";
import { useSubscription } from "../firebaseHelpers/useSubscription";
import { auth } from "../firebaseConfig";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function PricingPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isPro } = useSubscription();
  const [billing, setBilling] = useState<"monthly" | "yearly">("monthly");
  const [loading, setLoading] = useState<"trial" | "subscribe" | null>(null);

  const handleCheckout = async (useTrial: boolean) => {
    if (!user) {
      navigate("/signup");
      return;
    }

    setLoading(useTrial ? "trial" : "subscribe");
    try {
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch(`${API_URL}/api/stripe/create-checkout-session`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ plan: billing, trial: useTrial }),
      });

      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || "Failed to create checkout session");
      }
    } catch (err) {
      console.error("Checkout error:", err);
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(null);
    }
  };

  const features = [
    { name: "Feedback collection (QR code + form)", free: true, pro: true },
    { name: "QR code download (PNG)", free: true, pro: true },
    { name: "QR code download (SVG)", free: false, pro: true },
    { name: "Review dashboard", free: "7 days", pro: "All ranges" },
    { name: "All Reviews page", free: "7 days", pro: "Unlimited" },
    { name: "Action items (flagged reviews)", free: "First 3", pro: "Unlimited" },
    { name: "Mark as resolved", free: false, pro: true },
    { name: "Rewards", free: "1 max", pro: "Unlimited" },
    { name: "Brand customization", free: "Name + color", pro: "Full" },
    { name: "Live form preview", free: false, pro: true },
    { name: "Remove StarBoard branding", free: false, pro: true },
  ];

  const FeatureValue = ({ value }: { value: boolean | string }) => {
    if (value === true) return <Check size={18} className="text-green-500" />;
    if (value === false) return <X size={18} className="text-gray-300" />;
    return <span className="text-sm text-gray-700">{value}</span>;
  };

  return (
    <div className="min-h-screen bg-[#ffb133] py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-white mb-2" style={{ textShadow: "0 4px 12px rgba(0,0,0,0.15)" }}>
            Simple, transparent pricing
          </h1>
          <p className="text-lg text-white/80">Start free. Upgrade when you're ready.</p>
        </div>

        {/* Billing toggle */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex items-center gap-1 bg-white/20 backdrop-blur-sm rounded-full p-1">
            <button
              onClick={() => setBilling("monthly")}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition ${
                billing === "monthly" ? "bg-white text-gray-900 shadow" : "text-white hover:text-white/80"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBilling("yearly")}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition ${
                billing === "yearly" ? "bg-white text-gray-900 shadow" : "text-white hover:text-white/80"
              }`}
            >
              Yearly
              <span className="ml-1.5 text-xs font-bold text-green-600 bg-green-100 px-1.5 py-0.5 rounded-full">Save 17%</span>
            </button>
          </div>
        </div>

        {/* Pricing cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {/* Free */}
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <h2 className="text-xl font-bold text-gray-900">Free</h2>
            <p className="text-sm text-gray-500 mt-1">Perfect for getting started</p>
            <div className="mt-4">
              <span className="text-4xl font-extrabold text-gray-900">$0</span>
              <span className="text-gray-500 text-sm">/month</span>
            </div>
            <button
              onClick={() => navigate(user ? "/portal" : "/signup")}
              className="w-full mt-6 px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition"
            >
              {user ? (isPro ? "Current: Pro" : "Current Plan") : "Get Started"}
            </button>
          </div>

          {/* Pro */}
          <div className="bg-white rounded-2xl p-8 shadow-lg ring-2 ring-[#F2C125] relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-[#F2C125] to-[#FF8C1A] text-white text-xs font-bold rounded-full">
                <Sparkles size={12} /> MOST POPULAR
              </span>
            </div>
            <h2 className="text-xl font-bold text-gray-900">Pro</h2>
            <p className="text-sm text-gray-500 mt-1">Everything you need to grow</p>
            <div className="mt-4">
              <span className="text-4xl font-extrabold text-gray-900">
                ${billing === "monthly" ? "29" : "24"}
              </span>
              <span className="text-gray-500 text-sm">/month</span>
              {billing === "yearly" && (
                <span className="block text-xs text-gray-500 mt-1">$290 billed annually</span>
              )}
            </div>
            {isPro ? (
              <button
                disabled
                className="w-full mt-6 px-6 py-3 bg-gray-100 text-gray-500 font-semibold rounded-lg cursor-default"
              >
                Current Plan
              </button>
            ) : (
              <div className="mt-6 space-y-2">
                <button
                  onClick={() => handleCheckout(true)}
                  disabled={!!loading}
                  className="w-full px-6 py-3 bg-gradient-to-r from-[#F2C125] to-[#FF8C1A] text-white font-semibold rounded-lg hover:opacity-90 transition disabled:opacity-50"
                >
                  {loading === "trial" ? "Redirecting..." : "Start 14-Day Free Trial"}
                </button>
                <button
                  onClick={() => handleCheckout(false)}
                  disabled={!!loading}
                  className="w-full px-6 py-3 bg-gray-900 text-white font-semibold rounded-lg hover:bg-gray-800 transition disabled:opacity-50"
                >
                  {loading === "subscribe" ? "Redirecting..." : `Subscribe Now — $${billing === "monthly" ? "29/mo" : "290/yr"}`}
                </button>
              </div>
            )}
            <p className="text-xs text-gray-500 text-center mt-2">14-day trial doesn't require payment upfront</p>
          </div>
        </div>

        {/* Feature comparison */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="text-lg font-bold text-gray-900">Feature comparison</h3>
          </div>
          <div className="divide-y divide-gray-100">
            {features.map((f) => (
              <div key={f.name} className="flex items-center px-6 py-3">
                <span className="flex-1 text-sm text-gray-700">{f.name}</span>
                <div className="w-24 flex justify-center">
                  <FeatureValue value={f.free} />
                </div>
                <div className="w-24 flex justify-center">
                  <FeatureValue value={f.pro} />
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center px-6 py-2 bg-gray-50 text-xs text-gray-500 font-semibold">
            <span className="flex-1" />
            <span className="w-24 text-center">Free</span>
            <span className="w-24 text-center">Pro</span>
          </div>
        </div>

        <div className="text-center mt-8">
          <button onClick={() => navigate("/")} className="text-white/80 hover:text-white text-sm underline">
            Back to home
          </button>
        </div>
      </div>
    </div>
  );
}
