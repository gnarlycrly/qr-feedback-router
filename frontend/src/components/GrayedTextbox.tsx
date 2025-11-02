interface GrayedTextboxProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const GrayedTextbox = ({ className = "", ...props }: GrayedTextboxProps) => (
  <input
    {...props}
    className={`w-full rounded-lg border border-gray-300 bg-gray-100 p-2 focus:outline-none focus:ring-2 focus:ring-blue-400 ${className}`}
  />
);

export default GrayedTextbox;
