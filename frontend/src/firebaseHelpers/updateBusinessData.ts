import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../firebaseConfig";

export async function updateBusinessData(data: Record<string, any>) {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error("No logged-in user");

  const ref = doc(db, "businesses", uid);
  await updateDoc(ref, {
    ...data,
    updated_at: serverTimestamp(),
  });

  console.log("Business info updated:", data);
}
