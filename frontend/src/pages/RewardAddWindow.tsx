import { X } from "lucide-react";
import GrayContainer from "../components/GrayContainer";
import GrayedTextbox from "../components/GrayedTextbox";
import BlackButton from "../components/BlackButton";
import { useState } from "react";

type Reward = {
  title: string;
  description: string;
  type: "Percentage Discount" | "Free Item";
  value: string;
};

type RewardAddWindowProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (reward: Reward) => void;
};

const RewardAddWindow: React.FC<RewardAddWindowProps> = ({ isOpen, onClose, onSubmit }) => {
  const [newReward, setNewReward] = useState<Reward>({
    title: "",
    description: "",
    type: "Percentage Discount",
    value: "",
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
      <GrayContainer className="w-full max-w-md relative">
        <button
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
          onClick={onClose}
        >
          <X />
        </button>
        <h2 className="text-xl font-semibold mb-4">Create New Reward</h2>
        <div className="space-y-3">
          <GrayedTextbox
            placeholder="Reward Title"
            value={newReward.title}
            onChange={(e) => setNewReward({ ...newReward, title: e.target.value })}
          />
          <textarea
            placeholder="Description"
            className="w-full bg-gray-100 border border-gray-300 rounded-lg p-2"
            value={newReward.description}
            onChange={(e) => setNewReward({ ...newReward, description: e.target.value })}
          />
          <select
            className="w-full border rounded-lg p-2 bg-gray-100"
            value={newReward.type}
            onChange={(e) =>
              setNewReward({ ...newReward, type: e.target.value as Reward["type"] })
            }
          >
            <option>Percentage Discount</option>
            <option>Free Item</option>
          </select>
          <GrayedTextbox
            placeholder="Value (e.g., 20% or Free Dessert)"
            value={newReward.value}
            onChange={(e) => setNewReward({ ...newReward, value: e.target.value })}
          />
          {/* <div className="flex gap-2">
            <GrayedTextbox
              type="date"
              className="w-1/2"
              value={newReward.created}
              onChange={(e) => setNewReward({ ...newReward, created: e.target.value })}
            />
            <GrayedTextbox
              type="date"
              className="w-1/2"
              value={newReward.expires}
              onChange={(e) => setNewReward({ ...newReward, expires: e.target.value })}
            />
          </div> */}
          <BlackButton
            onClick={() => {
              if (!newReward.title || !newReward.value) return;
              onSubmit(newReward);
              setNewReward({
                title: "",
                description: "",
                type: "Percentage Discount",
                value: "",
              });
            }}
            label="Create Reward"
          />
        </div>
      </GrayContainer>
    </div>
  );
};

export default RewardAddWindow;
