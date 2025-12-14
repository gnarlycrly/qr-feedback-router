import { useState } from "react";
import RewardCard from "../components/RewardCard";
import RewardAddWindow from "./RewardAddWindow";

type Reward = {
  id: number;
  title: string;
  description: string;
  type: "Percentage Discount" | "Free Item";
  value: string;
  created: string;
  expires: string;
  active: boolean;
};

type RewardManagementProps = {
  showAddWindow: boolean;
  setShowAddWindow: (show: boolean) => void;
};

const RewardManagement = ({ showAddWindow, setShowAddWindow }: RewardManagementProps) => {

  // switch to database population eventually
  const [rewards, setRewards] = useState<Reward[]>([
    {
      id: 1,
      title: "15% Off Next Visit",
      description: "Valid for your next purchase within 30 days.",
      type: "Percentage Discount",
      value: "15%",
      created: "2025-10-01",
      expires: "2025-10-31",
      active: true,
    },
  ]);

  const addReward = (newReward: Omit<Reward, "id" | "active">) => {
    const reward: Reward = { ...newReward, id: rewards.length + 1, active: true };
    setRewards([...rewards, reward]);
    setShowAddWindow(false);
  };

  const toggleRewardActive = (id: number) => {
    setRewards(rewards.map((r) => (r.id === id ? { ...r, active: !r.active } : r)));
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
    </div>
  );
};

export default RewardManagement;
