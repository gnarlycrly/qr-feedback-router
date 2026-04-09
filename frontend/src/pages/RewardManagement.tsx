import RewardCard from "../components/RewardCard";
import RewardAddWindow from "./RewardAddWindow";
import RedemptionsPage from "./RedemptionsPage";

import { type Reward } from "../components/RewardType";
import { useRewards } from "../firebaseHelpers/useRewards";
import { useAuth } from "../firebaseHelpers/AuthContext";
import { useSubscription } from "../firebaseHelpers/useSubscription";
import UpgradeBanner from "../components/UpgradeBanner";
import { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../firebaseConfig";

type RewardManagementProps = {
  showAddWindow: boolean;
  setShowAddWindow: (show: boolean) => void;
};

const RewardManagement = ({ showAddWindow, setShowAddWindow }: RewardManagementProps) => {
  const { businessId } = useAuth();
  const { rewards, setRewards, saveRewards } = useRewards(businessId);
  const { isPro } = useSubscription();
  const canAddReward = isPro || rewards.length < 1;
  const [view, setView] = useState<"rewards" | "redemptions">("rewards");
  /** Keyed by trimmed rewardTitle from issuedRewards (matches reward.title at issuance). */
  const [redemptionStatsByTitle, setRedemptionStatsByTitle] = useState<
    Record<string, { issued: number; redeemed: number }>
  >({});

  useEffect(() => {
    if (!businessId || view !== "rewards") return;

    const loadStats = async () => {
      try {
        const q = query(collection(db, "issuedRewards"), where("businessId", "==", businessId));
        const snap = await getDocs(q);
        const byTitle: Record<string, { issued: number; redeemed: number }> = {};

        snap.forEach((docSnap) => {
          const data = docSnap.data() as {
            rewardTitle?: string | null;
            status?: string;
          };
          const title = (data.rewardTitle ?? "").trim();
          if (!title || title === "No active reward") return;

          if (!byTitle[title]) {
            byTitle[title] = { issued: 0, redeemed: 0 };
          }
          byTitle[title].issued += 1;
          if (data.status === "redeemed") {
            byTitle[title].redeemed += 1;
          }
        });

        setRedemptionStatsByTitle(byTitle);
      } catch (e) {
        console.error("Failed to load redemption stats for rewards:", e);
      }
    };

    void loadStats();
  }, [businessId, view]);

  const addReward = (newReward: Omit<Reward, "id" | "active">) => {
    const reward: Reward = {
      ...newReward,
      id: rewards.reduce((max, r) => Math.max(max, r.id), 0) + 1,
      active: false,
    };

    const updated = [...rewards, reward];
    setRewards(updated);
    saveRewards(updated);
    setShowAddWindow(false);
  };

  const toggleRewardActive = (id: number) => {
    // If activating a reward, ensure all others are deactivated so only one is active at a time.
    const current = rewards.find((r) => r.id === id);
    const willActivate = current ? !current.active : true;

    const updated = rewards.map((r) => ({
      ...r,
      active: willActivate ? r.id === id : r.id === id ? false : r.active,
    }));

    setRewards(updated);
    saveRewards(updated);
  };

  const deleteReward = (id: number) => {
    const updated = rewards.filter((r) => r.id !== id);
    setRewards(updated);
    saveRewards(updated);
  };

  return (
    // Make the rewards tab take up most of the viewport by default and keep
    // the tab size stable. The list itself will scroll internally.
    <div className="max-w-3xl mx-auto w-full max-h-[calc(100vh-220px)] flex flex-col">
      <div className="mb-3 flex justify-end">
        {view === "rewards" ? (
          <button
            onClick={() => setView("redemptions")}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-800 hover:bg-gray-50"
          >
            View Redemptions
          </button>
        ) : (
          <button
            onClick={() => setView("rewards")}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-800 hover:bg-gray-50"
          >
            Back to Rewards
          </button>
        )}
      </div>

      {view === "rewards" ? (
        <>
          <div className="overflow-auto flex-1 space-y-4 pb-4">
            {rewards.map((reward) => (
              <RewardCard
                key={reward.id}
                reward={reward}
                onToggleActive={toggleRewardActive}
                onDelete={deleteReward}
                redemptionCounts={redemptionStatsByTitle[reward.title.trim()] ?? { issued: 0, redeemed: 0 }}
              />
            ))}
          </div>

          {!canAddReward && (
            <UpgradeBanner feature="Unlimited Rewards" />
          )}

          <RewardAddWindow
            isOpen={showAddWindow && canAddReward}
            onClose={() => setShowAddWindow(false)}
            onSubmit={addReward}
          />
        </>
      ) : (
        <div className="overflow-auto flex-1 pb-2">
          <RedemptionsPage businessId={businessId} />
        </div>
      )}
    </div>
  );
};

export default RewardManagement;