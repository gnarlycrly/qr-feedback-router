import { useState } from "react";
import { Gift, Building, Palette, QrCode } from "lucide-react";
import RewardManagement from "./RewardManagement";
import BusinessInformation from "./BusinessInformation";
import BrandCustomization from "./BrandCustomization";
import QRCodeGeneration from "./QRCodeGeneration";

const BusinessPortal = () => {
  const [activeTab, setActiveTab] = useState<"rewards" | "business" | "brand" | "qr">("rewards");

  return (
    <div className="min-h-screen flex bg-gray-50">
      <aside className="w-60 bg-[#1A3673] text-white flex flex-col p-4 space-y-4">
        <h1 className="text-xl font-bold mb-6">Business Portal</h1>
        <NavButton label="Reward Management" icon={<Gift size={18} />} active={activeTab === "rewards"} onClick={() => setActiveTab("rewards")} />
        <NavButton label="Business Information" icon={<Building size={18} />} active={activeTab === "business"} onClick={() => setActiveTab("business")} />
        <NavButton label="Brand Customization" icon={<Palette size={18} />} active={activeTab === "brand"} onClick={() => setActiveTab("brand")} />
        <NavButton label="QR Code Generation" icon={<QrCode size={18} />} active={activeTab === "qr"} onClick={() => setActiveTab("qr")} />
      </aside>

      <main className="flex-1 p-8 overflow-y-auto">
        {activeTab === "rewards" && <RewardManagement />}
        {activeTab === "business" && <BusinessInformation />}
        {activeTab === "brand" && <BrandCustomization />}
        {activeTab === "qr" && <QRCodeGeneration />}
      </main>
    </div>
  );
};

const NavButton = ({ icon, label, active, onClick }: any) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition ${
      active ? "bg-blue-500 text-white" : "hover:bg-blue-800"
    }`}
  >
    {icon}
    {label}
  </button>
);

export default BusinessPortal;
