import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { useAuth } from "./AuthContext";

export interface SubscriptionData {
  status: "free" | "active" | "past_due" | "canceled" | "trialing";
  plan: "free" | "pro";
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  currentPeriodEnd: number | null;
  cancelAtPeriodEnd: boolean;
}

const DEFAULT_SUBSCRIPTION: SubscriptionData = {
  status: "free",
  plan: "free",
  stripeCustomerId: null,
  stripeSubscriptionId: null,
  currentPeriodEnd: null,
  cancelAtPeriodEnd: false,
};

export function useSubscription() {
  const { businessId, loading: authLoading } = useAuth();
  const [subscription, setSubscription] = useState<SubscriptionData>(DEFAULT_SUBSCRIPTION);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!businessId) {
      setSubscription(DEFAULT_SUBSCRIPTION);
      setIsLoading(false);
      return;
    }

    const unsub = onSnapshot(doc(db, "businesses", businessId), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        const sub = data.subscription || {};
        setSubscription({
          status: sub.status || "free",
          plan: sub.plan || "free",
          stripeCustomerId: sub.stripeCustomerId || null,
          stripeSubscriptionId: sub.stripeSubscriptionId || null,
          currentPeriodEnd: sub.currentPeriodEnd || null,
          cancelAtPeriodEnd: sub.cancelAtPeriodEnd || false,
        });
      }
      setIsLoading(false);
    });

    return () => unsub();
  }, [businessId, authLoading]);

  const isPro = subscription.plan === "pro" && ["active", "trialing"].includes(subscription.status);

  return {
    ...subscription,
    isPro,
    isLoading,
  };
}
