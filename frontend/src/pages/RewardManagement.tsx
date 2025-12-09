import { useState } from "react";
import { Gift, Plus } from "lucide-react";
import StatCard from "../components/StatCard";
import GrayContainer from "../components/GrayContainer";
import BlackButton from "../components/BlackButton";
import RewardCard from "../components/RewardCard";
import RewardAddWindow from "./RewardAddWindow";
import { auth } from "../firebaseConfig";
import { signOut } from "firebase/auth";
import {type Reward} from "../components/RewardType";
import { useRewards } from "../firebaseHelpers/useRewards";
import { useAuth } from "../firebaseHelpers/AuthContext"; 

const RewardManagement = () => {

  const { businessId } = useAuth(); 
  if(!businessId){
    return <p>Loading...</p>;
  }
  const {rewards, setRewards, saveRewards} = useRewards(businessId); 
  const [showAddWindow, setShowAddWindow] = useState(false);

  const addReward = (newReward: Omit<Reward, "id" | "active">) => {
    console.log(newReward);
    const reward: Reward = { ...newReward, id: rewards.length + 1, active: false };
    const updated = [...rewards, reward]
    setRewards(updated);
    setShowAddWindow(false);
    saveRewards(updated);
  };

  const toggleRewardActive = (id: number) => {
    const updated = rewards.map((r) => (r.id === id ? { ...r, active: !r.active } : r));
    setRewards(updated);
    saveRewards(updated);
  };

  const stats = {
    activeRewards: rewards.filter((r) => r.active).length,
    totalRedemptions: 82,
    redemptionRate: 23,
    avgRewardValue: "$8.50",
  };

  return (
    <div>
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
    <BlackButton onClick={() => signOut(auth)} label="Sign Out"></BlackButton>
    </div>
  );
};

export default RewardManagement;
