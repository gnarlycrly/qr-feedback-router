import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebaseConfig";

interface BusinessData {
  owner_uid: string;
  name: string;
  address: string;
  phone_number : string;
  website_url : string;
  email : string;
}

export function getBusinessData() {
  const [business, setBusiness] = useState<BusinessData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadBusiness = async () => {
      const uid = auth.currentUser?.uid;
      if (!uid) {
        setBusiness(null);
        setLoading(false);
        return;
      }

      try {
        const ref = doc(db, "businesses", uid);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          setBusiness(snap.data() as BusinessData);
        } else {
          setBusiness(null);
        }
      } catch (err) {
        console.error("Error loading business:", err);
      } finally {
        setLoading(false);
      }
    };

    loadBusiness();
  }, []);

  return { business, loading };
}
