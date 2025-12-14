import { useEffect, useState } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { type Reward } from "../components/RewardType"; // ✅ Correct import

export function useRewards(businessId: string) {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRewards() {
      if (!businessId) return;

      const ref = doc(db, "businesses", businessId);
      const snap = await getDoc(ref);

      if (snap.exists()) {
        const data = snap.data();
        setRewards((data.rewards as Reward[]) ?? []);
      }

      setLoading(false);
    }

    fetchRewards();
  }, [businessId]);

  // Save complete reward list back to Firestore
  async function saveRewards(newRewards: Reward[]) {
    if (!businessId) return;

    const ref = doc(db, "businesses", businessId);
    await updateDoc(ref, { rewards: newRewards });

    setRewards(newRewards);
  }

  return {
    rewards,
    setRewards,
    saveRewards,
    loading,
  };
}
