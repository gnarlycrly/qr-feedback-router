import { Calendar } from "lucide-react";
import GrayContainer from "./GrayContainer";
import BlackButton from "./BlackButton";

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

type RewardCardProps = {
  reward: Reward;
  onToggleActive: (id: number) => void;
};

const RewardCard: React.FC<RewardCardProps> = ({ reward, onToggleActive }) => {
  return (
    <GrayContainer className="flex justify-between items-start">
      <div>
        <h3 className="font-semibold text-gray-800">{reward.title}</h3>
        <p className="text-sm text-gray-600">{reward.description}</p>
        <div className="text-xs text-gray-500 mt-1 flex gap-4">
          <span>{reward.type}</span>
          <span>
            <Calendar className="inline w-3 h-3 mr-1" />
            {reward.created}
          </span>
          <span>Expires: {reward.expires}</span>
        </div>
      </div>
      <BlackButton
        onClick={() => onToggleActive(reward.id)}
        className={`px-3 py-1 text-sm ${
          reward.active ? "bg-green-700" : "bg-gray-500"
        }`}
      >
        {reward.active ? "Active" : "Inactive"}
      </BlackButton>
    </GrayContainer>
  );
};

export default RewardCard;
