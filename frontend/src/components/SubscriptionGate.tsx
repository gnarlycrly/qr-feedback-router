import { useSubscription } from "../firebaseHelpers/useSubscription";
import UpgradeBanner from "./UpgradeBanner";

interface SubscriptionGateProps {
  feature: string;
  children: React.ReactNode;
  mode?: "blur" | "hide" | "banner";
}

export default function SubscriptionGate({ feature, children, mode = "blur" }: SubscriptionGateProps) {
  const { isPro, isLoading } = useSubscription();

  if (isLoading) return <>{children}</>;

  if (isPro) return <>{children}</>;

  if (mode === "hide") return null;

  if (mode === "banner") {
    return <UpgradeBanner feature={feature} />;
  }

  // blur mode
  return (
    <div className="relative">
      <div className="pointer-events-none select-none blur-sm opacity-60">
        {children}
      </div>
      <div className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-[2px] rounded-xl">
        <UpgradeBanner feature={feature} compact />
      </div>
    </div>
  );
}
