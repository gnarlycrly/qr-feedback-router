interface BlackButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label?: string;
}

const BlackButton = ({ label, className = "", children, ...props }: BlackButtonProps) => (
  <button
    {...props}
    className={`bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition font-medium ${className}`}
  >
    {label || children}
  </button>
);

export default BlackButton;
