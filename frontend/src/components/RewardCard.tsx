import GrayContainer from "./GrayContainer";
import {type Reward} from "../components/RewardType";

type RewardCardProps = {
  reward: Reward;
  onToggleActive: (id: number) => void;
};

const RewardCard: React.FC<RewardCardProps> = ({ reward, onToggleActive }) => {
  return (
    <GrayContainer className="flex justify-between items-start">
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="font-semibold text-gray-800">{reward.title}</h3>
          <span
            className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
              reward.active ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-600"
            }`}
          >
            {reward.active ? "Active" : "Inactive"}
          </span>
        </div>
        <p className="text-sm text-gray-600">{reward.description}</p>
        <div className="text-xs text-gray-500 mt-1 flex gap-4">
          <span>{reward.type + " - " + reward.value }</span>
        </div>
      </div>
      <label className="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          checked={reward.active}
          onChange={() => onToggleActive(reward.id)}
          className="sr-only peer"
        />
        <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
      </label>
    </GrayContainer>
  );
};

export default RewardCard;
