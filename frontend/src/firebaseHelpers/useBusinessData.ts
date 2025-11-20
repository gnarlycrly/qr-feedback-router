import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { useAuth } from "./AuthContext"; 

interface BusinessData {
  name: string;
  address: string;
  phone_number: string;
  website_url: string;
  email: string;
  customer_businessName: string;
  customer_primaryColor: string;
  customer_accentColor: string;
  customer_headerText: string;
  customer_ratingPrompt: string;
  customer_feedbackPrompt: string;
  customer_submitButtonText: string;
}


export function useBusinessData() {
  const { businessId, loading: authLoading } = useAuth(); 
  const [business, setBusiness] = useState<BusinessData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;              
    if (!businessId) {                    
      setBusiness(null);
      setLoading(false);
      return;
    }

    const loadBusiness = async () => {
      try {
        const ref = doc(db, "businesses", businessId);
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
  }, [businessId, authLoading]); 

  return { business, loading };
}
