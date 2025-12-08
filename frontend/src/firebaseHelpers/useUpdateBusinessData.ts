import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { useAuth } from "./AuthContext";

/**
 * Hook to update the current business.
 * Automatically uses the businessId from AuthContext.
 */
export function useUpdateBusinessData() {
  const { businessId } = useAuth();

  async function updateBusinessData(data: Record<string, any>) {
    if (!businessId) throw new Error("No businessId found in AuthContext");

    const ref = doc(db, "businesses", businessId);

    await updateDoc(ref, {
      ...data,
      updated_at: serverTimestamp(),
    });

    console.log("Business info updated:", data);
  }

  return updateBusinessData;
}
