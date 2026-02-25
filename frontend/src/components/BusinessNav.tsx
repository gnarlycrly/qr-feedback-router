import { Gift, Building, QrCode, MessageCircle } from "lucide-react";

type Tab = "rewards" | "business" | "qr" | "reviews";

type BusinessNavProps = {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
};

const BusinessNav = ({ activeTab, onTabChange }: BusinessNavProps) => {
  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm mb-6">
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-1 px-4">
        <NavButton
          label="Rewards"
          icon={<Gift size={18} />}
          active={activeTab === "rewards"}
          onClick={() => onTabChange("rewards")}
        />
        <NavButton
          label="Edit Info"
          icon={<Building size={18} />}
          active={activeTab === "business"}
          onClick={() => onTabChange("business")}
        />
        <NavButton
          label="QR Code"
          icon={<QrCode size={18} />}
          active={activeTab === "qr"}
          onClick={() => onTabChange("qr")}
        />
        <NavButton
          label="Reviews"
          icon={<MessageCircle size={18} />}
          active={activeTab === "reviews"}
          onClick={() => onTabChange("reviews")}
        />
      </div>
    </nav>
  );
};

const NavButton = ({ icon, label, active, onClick }: any) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all border-b-2 ${
      active
        ? "border-[#f2c125] text-gray-900"
        : "border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300"
    }`}
  >
    {icon}
    <span>{label}</span>
  </button>
);

export default BusinessNav;
