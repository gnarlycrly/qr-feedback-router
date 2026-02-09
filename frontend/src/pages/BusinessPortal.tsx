// Business portal: simple tabbed interface for business owners to manage rewards, branding, QR codes and preview.
import { useState } from "react";
import { Gift, Building, QrCode, MessageCircle, Plus } from "lucide-react";
import RewardManagement from "./RewardManagement";
import BusinessEdit from "./BusinessEdit";
import QRCodeGeneration from "./QRCodeGeneration";
import CustomerServiceDashboardPage from "./CustomerServiceDashboardPage";

const BusinessPortal = () => {
  const [activeTab, setActiveTab] = useState<"rewards" | "business" | "qr" | "reviews">("rewards");
  const [showAddRewardWindow, setShowAddRewardWindow] = useState(false);

  return (
    <div className="flex min-h-[calc(100vh-200px)] gap-6">
      {/* Modern Sidebar */}
      <aside className="w-72 bg-white rounded-2xl shadow-lg border border-gray-100 p-6 flex flex-col gap-2 h-fit sticky top-24">
        <div className="mb-4">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Business Portal
          </h1>
          <p className="text-sm text-gray-500 mt-1">Manage your business</p>
        </div>
        
        <div className="space-y-1">
          <NavButton label="Reward Management" icon={<Gift size={18} />} active={activeTab === "rewards"} onClick={() => setActiveTab("rewards")} />
          <NavButton label="Edit Info / Customize" icon={<Building size={18} />} active={activeTab === "business"} onClick={() => setActiveTab("business")} />
          <NavButton label="QR Code Generation" icon={<QrCode size={18} />} active={activeTab === "qr"} onClick={() => setActiveTab("qr")} />
          {/* Customer View removed — preview now available in Edit Info / Customize */}
          <NavButton label="Review Monitoring" icon={<MessageCircle size={18} />} active={activeTab === "reviews"} onClick={() => setActiveTab("reviews")} />
        </div>
      </aside>

      {/* Modern Content Area */}
      <main className="flex-1 bg-white rounded-2xl shadow-lg border border-gray-100 p-8 overflow-y-auto">
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {activeTab === "rewards" ? "Reward Management" :
               activeTab === "business" ? "Edit Info / Customize" :
               activeTab === "qr" ? "QR Code Generation" :
               activeTab === "reviews" ? "Review Monitoring" : "Business Portal"}
            </h1>
            <p className="text-gray-600">
              {activeTab === "rewards" ? "Create and manage customer rewards" :
               activeTab === "business" ? "Update business details and feedback form customization" :
               activeTab === "qr" ? "Generate QR codes for customers" :
               activeTab === "reviews" ? "Monitor customer feedback and reviews" : "Manage your business settings"}
            </p>
          </div>
          
          {/* Action buttons for specific tabs */}
          {activeTab === "rewards" && (
            <button
              onClick={() => setShowAddRewardWindow(true)}
              className="flex items-center gap-2 px-6 py-2 bg-gray-900 text-white font-semibold rounded-lg hover:bg-gray-800 transition-colors"
            >
              <Plus size={18} />
              Create Reward
            </button>
          )}
        </div>

  {activeTab === "rewards" && <RewardManagement showAddWindow={showAddRewardWindow} setShowAddWindow={setShowAddRewardWindow} />}
  {activeTab === "business" && <BusinessEdit />}
        {activeTab === "qr" && <QRCodeGeneration />}
  {/* CustomerFormPreview removed — preview is available in Edit Info / Customize */}
        {activeTab === "reviews" && <CustomerServiceDashboardPage />}
      </main>
    </div>
  );
};

const NavButton = ({ icon, label, active, onClick }: any) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
      active 
        ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/30" 
        : "text-gray-700 hover:bg-gray-50 hover:text-blue-600"
    }`}
  >
    <span className={active ? "opacity-100" : "opacity-60"}>{icon}</span>
    <span>{label}</span>
  </button>
);

export default BusinessPortal;
