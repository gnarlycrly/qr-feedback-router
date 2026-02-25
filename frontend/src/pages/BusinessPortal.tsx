import { useState } from "react";
import { Plus } from "lucide-react";
import RewardManagement from "./RewardManagement";
import BusinessEdit from "./BusinessEdit";
import InfoTooltip from "../components/InfoTooltip";
import QRCodeGeneration from "./QRCodeGeneration";
import CustomerServiceDashboardPage from "./CustomerServiceDashboardPage";
import BusinessNav from "../components/BusinessNav";

const BusinessPortal = () => {
  const [activeTab, setActiveTab] = useState<"rewards" | "business" | "qr" | "reviews">("rewards");
  const [showAddRewardWindow, setShowAddRewardWindow] = useState(false);

  return (
    <div className="max-w-7xl mx-auto">
      <BusinessNav activeTab={activeTab} onTabChange={setActiveTab} />
      
      <div>
        <main className="rounded-2xl shadow-lg border border-gray-100 p-8" style={{ backgroundColor: '#f9e5af' }}>
        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {activeTab === "rewards" ? "Reward Management" :
                 activeTab === "business" ? "Edit Info / Customize" :
                 activeTab === "qr" ? "QR Code Generation" :
                 activeTab === "reviews" ? "Review Monitoring" : "Business Portal"}
              </h1>
              <p className="text-gray-600">
                {activeTab === "rewards" ? (
                  <>Create and manage customer rewards <InfoTooltip text="Set up promotional rewards for customers who leave feedback. Only one reward can be active at a time." /></>
                ) : activeTab === "business" ? "Update business details and feedback form customization" :
                 activeTab === "qr" ? "Generate QR codes for customers" :
                 activeTab === "reviews" ? (
                  <>Monitor customer feedback and reviews <InfoTooltip text="Track incoming reviews in real time. Negative reviews are flagged as action items for follow-up." /></>
                ) : "Manage your business settings"}
              </p>
            </div>
          </div>
          
          {/* Action buttons for specific tabs */}
          {activeTab === "rewards" && (
            <button
              onClick={() => setShowAddRewardWindow(true)}
              className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-[#F2C125] to-[#FF8C1A] text-white font-semibold rounded-lg hover:opacity-90 transition-all"
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
    </div>
  );
};

export default BusinessPortal;
