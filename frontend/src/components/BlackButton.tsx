interface BlackButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label?: string;
}

const BlackButton = ({ label, className = "", children, ...props }: BlackButtonProps) => (
  <button
    {...props}
    className={`btn-app-primary px-4 py-2 rounded-lg hover:opacity-95 transition font-medium ${className}`}
  >
    {label || children}
  </button>
);

export default BlackButton;
