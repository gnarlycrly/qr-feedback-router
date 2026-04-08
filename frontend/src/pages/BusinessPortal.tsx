import { useState } from "react";
import { useLocation } from "react-router-dom";
import { Plus } from "lucide-react";
import RewardManagement from "./RewardManagement";
import BusinessEdit from "./BusinessEdit";
import InfoTooltip from "../components/InfoTooltip";
import QRCodeGeneration from "./QRCodeGeneration";
import CustomerServiceDashboardPage from "./CustomerServiceDashboardPage";
import HelpSupportPage from "./HelpSupportPage";
import BusinessNav from "../components/BusinessNav";
import { useSubscription } from "../firebaseHelpers/useSubscription";
import { useRewards } from "../firebaseHelpers/useRewards";
import { useAuth } from "../firebaseHelpers/AuthContext";

const BusinessPortal = () => {
  const location = useLocation();

  const getInitialTab = () => {
    try {
      const params = new URLSearchParams(location.search);
      const tab = params.get("tab");
      if (tab === "rewards" || tab === "business" || tab === "qr" || tab === "reviews" || tab === "help") return tab as any;
      const stateTab = (location.state as any)?.tab;
      if (stateTab === "rewards" || stateTab === "business" || stateTab === "qr" || stateTab === "reviews" || stateTab === "help") return stateTab as any;
    } catch (e) {
      // ignore
    }
    return "rewards";
  };

  const [activeTab, setActiveTab] = useState<"rewards" | "business" | "qr" | "reviews" | "help">(getInitialTab());
  const [showAddRewardWindow, setShowAddRewardWindow] = useState(false);
  const { isPro } = useSubscription();
  const { businessId } = useAuth();
  const { rewards } = useRewards(businessId);
  const canAddReward = isPro || rewards.length < 1;

  return (
    <div className="max-w-7xl mx-auto">
      <BusinessNav activeTab={activeTab} onTabChange={setActiveTab} />
      
      <div>
  <main className={"rounded-2xl shadow-lg border border-gray-100 bg-white " + (activeTab === "reviews" || activeTab === "help" ? "pt-0 pb-6 px-6" : "p-6")}>
        <div className="max-w-3xl mx-auto">
          <div className="mb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="text-left">
                {activeTab !== "reviews" && activeTab !== "help" && (
                  <>
                    <h1 className="text-3xl font-bold text-gray-900 mb-1">
                      {activeTab === "rewards" ? "Reward Management" :
                       activeTab === "business" ? "Edit Info / Customize" :
                       activeTab === "qr" ? "QR Code Generation" : "Business Portal"}
                    </h1>
                    <p className="text-gray-600 max-w-2xl">
                      {activeTab === "rewards" ? (
                        <>Create and manage customer rewards <InfoTooltip text="Set up promotional rewards for customers who leave feedback. Only one reward can be active at a time." /></>
                      ) : activeTab === "business" ? "Update business details and feedback form customization" :
                       activeTab === "qr" ? "Generate QR codes for customers" : "Manage your business settings"}
                    </p>
                  </>
                )}
              </div>

              {activeTab === "rewards" && canAddReward && (
                <div className="flex-shrink-0">
                  <button
                    onClick={() => setShowAddRewardWindow(true)}
                    className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-[#F2C125] to-[#FF8C1A] text-white font-semibold rounded-lg hover:opacity-90 transition-all"
                  >
                    <Plus size={18} />
                    Create Reward
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Tab content container enforces consistent width for each tab */}
          <div className="max-w-3xl mx-auto">
            <div className="flex justify-center">
              {activeTab === "rewards" && (
                <div className="w-full max-w-3xl mx-auto">
                  <div className="rounded-2xl bg-white p-6 shadow-lg">
                    <RewardManagement showAddWindow={showAddRewardWindow} setShowAddWindow={setShowAddRewardWindow} />
                  </div>
                </div>
              )}

              {activeTab === "business" && (
                <div className="w-full max-w-3xl mx-auto">
                  <div className="rounded-2xl bg-white p-6 shadow-lg">
                    <BusinessEdit />
                  </div>
                </div>
              )}

              {activeTab === "qr" && (
                <div className="w-full max-w-3xl mx-auto">
                  <div className="rounded-2xl bg-white p-6 shadow-lg">
                    <QRCodeGeneration />
                  </div>
                </div>
              )}

              {/* CustomerFormPreview removed — preview is available in Edit Info / Customize */}
              {activeTab === "reviews" && (
                <div className="w-full max-w-3xl mx-auto">
                  <div className="rounded-2xl bg-white p-6 shadow-lg">
                    <CustomerServiceDashboardPage />
                  </div>
                </div>
              )}

              {activeTab === "help" && (
                <div className="w-full max-w-3xl mx-auto">
                  <div className="rounded-2xl bg-white p-6 shadow-lg">
                    <HelpSupportPage />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      </div>
    </div>
  );
};

export default BusinessPortal;
