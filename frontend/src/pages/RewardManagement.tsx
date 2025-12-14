import RewardCard from "../components/RewardCard";
import RewardAddWindow from "./RewardAddWindow";

import { auth } from "../firebaseConfig";
import { signOut } from "firebase/auth";
import { type Reward } from "../components/RewardType";
import { useRewards } from "../firebaseHelpers/useRewards";
import { useAuth } from "../firebaseHelpers/AuthContext";

type RewardManagementProps = {
  showAddWindow: boolean;
  setShowAddWindow: (show: boolean) => void;
};

const RewardManagement = ({ showAddWindow, setShowAddWindow }: RewardManagementProps) => {
  const { businessId } = useAuth();

  if (!businessId) {
    return <p>Loading...</p>;
  }

  const { rewards, setRewards, saveRewards } = useRewards(businessId);

  const addReward = (newReward: Omit<Reward, "id" | "active">) => {
    const reward: Reward = {
      ...newReward,
      id: rewards.length + 1,
      active: false,
    };

    const updated = [...rewards, reward];
    setRewards(updated);
    saveRewards(updated);
    setShowAddWindow(false);
  };

  const toggleRewardActive = (id: number) => {
    const updated = rewards.map((r) =>
      r.id === id ? { ...r, active: !r.active } : r
    );
    setRewards(updated);
    saveRewards(updated);
  };

  return (
    <div>
      <div className="space-y-4">
        {rewards.map((reward) => (
          <RewardCard
            key={reward.id}
            reward={reward}
            onToggleActive={toggleRewardActive}
          />
        ))}
      </div>

      <RewardAddWindow
        isOpen={showAddWindow}
        onClose={() => setShowAddWindow(false)}
        onSubmit={addReward}
      />

      <button onClick={() => signOut(auth)} className="mt-6">
        Sign Out
      </button>
    </div>
  );
};

export default RewardManagement;