import type { ReactNode } from "react";

interface GrayContainerProps {
  children: ReactNode;
  className?: string;
}

const GrayContainer = ({ children, className = "" }: GrayContainerProps) => (
  <div className={`bg-gray-100 rounded-2xl p-6 shadow ${className}`}>
    {children}
  </div>
);

export default GrayContainer;
