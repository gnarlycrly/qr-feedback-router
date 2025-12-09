// import { Calendar } from "lucide-react";
import GrayContainer from "./GrayContainer";
import BlackButton from "./BlackButton";
import {type Reward} from "../components/RewardType";

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
          <span>{reward.type + " - " + reward.value }</span>
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
