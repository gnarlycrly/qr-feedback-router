// Business portal: simple tabbed interface for business owners to manage rewards, branding, QR codes and preview.
import { useState } from "react";
import { Gift, Building, QrCode, Eye, MessageCircle } from "lucide-react";
import RewardManagement from "./RewardManagement";
import BusinessInformation from "./BusinessInformation";
import QRCodeGeneration from "./QRCodeGeneration";
import CustomerServiceDashboardPage from "./CustomerServiceDashboardPage";
import CustomerFormPreview from "./CustomerFormPreview";

const BusinessPortal = () => {
  const [activeTab, setActiveTab] = useState<"rewards" | "business" | "brand" | "qr" | "preview" | "reviews">("rewards");

  return (
    <div className="flex">
      <aside className="w-60 bg-app-primary text-white flex flex-col p-4 space-y-4">
        <h1 className="text-xl font-bold mb-6">Business Portal</h1>
        <NavButton label="Reward Management" icon={<Gift size={18} />} active={activeTab === "rewards"} onClick={() => setActiveTab("rewards")} />
        <NavButton label="Business Information" icon={<Building size={18} />} active={activeTab === "business"} onClick={() => setActiveTab("business")} />
        {/* <NavButton label="Brand Customization" icon={<Palette size={18} />} active={activeTab === "brand"} onClick={() => setActiveTab("brand")} /> */}
  <NavButton label="QR Code Generation" icon={<QrCode size={18} />} active={activeTab === "qr"} onClick={() => setActiveTab("qr")} />
  <NavButton label="Customer View" icon={<Eye size={18} />} active={activeTab === "preview"} onClick={() => setActiveTab("preview")} />
  <NavButton label="Review Monitoring" icon={<MessageCircle size={18} />} active={activeTab === "reviews"} onClick={() => setActiveTab("reviews")} />
      </aside>

      <main className="flex-1 p-8 overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="page-heading">
            {activeTab === "preview" ? "Customer Form Preview" : 
             activeTab === "rewards" ? "Reward Management" : "Business Portal"}
          </h1>
          {/* management button removed; use left-side nav tab to open Reward Management */}
        </div>

        {activeTab === "rewards" && <RewardManagement />}
        {activeTab === "business" && <BusinessInformation />}
        {/* {activeTab === "brand" && <BrandCustomization />} */}
        {activeTab === "qr" && <QRCodeGeneration />}
        {activeTab === "preview" && <CustomerFormPreview />}
        {activeTab === "reviews" && <CustomerServiceDashboardPage />}
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
