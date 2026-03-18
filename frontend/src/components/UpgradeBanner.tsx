import { Lock, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface UpgradeBannerProps {
  feature?: string;
  compact?: boolean;
}

export default function UpgradeBanner({ feature, compact = false }: UpgradeBannerProps) {
  const navigate = useNavigate();

  if (compact) {
    return (
      <div className="flex flex-col items-center gap-2 p-4">
        <div className="flex items-center gap-2 text-gray-700">
          <Lock size={16} />
          <span className="text-sm font-semibold">{feature || "This feature"} requires Pro</span>
        </div>
        <button
          onClick={() => navigate("/pricing")}
          className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-[#F2C125] to-[#FF8C1A] text-white text-sm font-semibold rounded-lg hover:opacity-90 transition"
        >
          <Sparkles size={14} />
          Upgrade to Pro
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between gap-4 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 p-4">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#F2C125] to-[#FF8C1A]">
          <Lock size={18} className="text-white" />
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-900">{feature || "This feature"} is a Pro feature</p>
          <p className="text-xs text-gray-600">Upgrade to unlock all features with a 14-day free trial</p>
        </div>
      </div>
      <button
        onClick={() => navigate("/pricing")}
        className="flex items-center gap-1.5 px-5 py-2.5 bg-gradient-to-r from-[#F2C125] to-[#FF8C1A] text-white text-sm font-semibold rounded-lg hover:opacity-90 transition shrink-0"
      >
        <Sparkles size={14} />
        Upgrade
      </button>
    </div>
  );
}
