import type { ReactNode } from "react";
import GrayContainer from "./GrayContainer";

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: ReactNode;
}

const StatCard = ({ label, value, icon }: StatCardProps) => (
  <GrayContainer className="flex items-center gap-3">
    {icon && <div className="text-blue-600">{icon}</div>}
    <div>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-lg font-semibold text-gray-800">{value}</p>
    </div>
  </GrayContainer>
);

export default StatCard;
