import { useState } from "react";
import { Gift, Plus } from "lucide-react";
import StatCard from "../components/StatCard";
import GrayContainer from "../components/GrayContainer";
import BlackButton from "../components/BlackButton";
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

const RewardManagement = () => {

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

  const [showAddWindow, setShowAddWindow] = useState(false);

  const addReward = (newReward: Omit<Reward, "id" | "active">) => {
    const reward: Reward = { ...newReward, id: rewards.length + 1, active: true };
    setRewards([...rewards, reward]);
    setShowAddWindow(false);
  };

  const toggleRewardActive = (id: number) => {
    setRewards(rewards.map((r) => (r.id === id ? { ...r, active: !r.active } : r)));
  };

  const stats = {
    activeRewards: rewards.filter((r) => r.active).length,
    totalRedemptions: 82,
    redemptionRate: 23,
    avgRewardValue: "$8.50",
  };

  return (
    <GrayContainer>
      <div className="flex items-center justify-between mb-6">
        <h1 className="page-heading">Reward Management</h1>
        <BlackButton onClick={() => setShowAddWindow(true)} label="Create Reward">
          <Plus size={18} className="inline mr-2" />
        </BlackButton>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard label="Active Rewards" value={stats.activeRewards} icon={<Gift />} />
        <StatCard label="Total Redemptions" value={stats.totalRedemptions} icon={<Gift />} />
        <StatCard label="Redemption Rate" value={`${stats.redemptionRate}%`} icon={<Gift />} />
        <StatCard label="Avg Reward Value" value={stats.avgRewardValue} icon={<Gift />} />
      </div>

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
    </GrayContainer>
  );
};

export default RewardManagement;
