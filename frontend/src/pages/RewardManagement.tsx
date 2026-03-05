import RewardCard from "../components/RewardCard";
import RewardAddWindow from "./RewardAddWindow";

// import { auth } from "../firebaseConfig";
// import { signOut } from "firebase/auth";
import { type Reward } from "../components/RewardType";
import { useRewards } from "../firebaseHelpers/useRewards";
import { useAuth } from "../firebaseHelpers/AuthContext";

type RewardManagementProps = {
  showAddWindow: boolean;
  setShowAddWindow: (show: boolean) => void;
};

const RewardManagement = ({ showAddWindow, setShowAddWindow }: RewardManagementProps) => {
  const { businessId } = useAuth();
  const { rewards, setRewards, saveRewards } = useRewards(businessId);

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
      <div className="overflow-auto flex-1 space-y-4 pb-4">
        {rewards.map((reward) => (
          <RewardCard
            key={reward.id}
            reward={reward}
            onToggleActive={toggleRewardActive}
            onDelete={deleteReward}
          />
        ))}
      </div>

      <RewardAddWindow
        isOpen={showAddWindow}
        onClose={() => setShowAddWindow(false)}
        onSubmit={addReward}
      />

      {/* <button onClick={() => signOut(auth)} className="mt-6">
        Sign Out
      </button> */}
    </div>
  );
};

export default RewardManagement;