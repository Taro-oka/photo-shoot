type RoundedButtonProps = {
  children: React.ReactNode;
  onClick: () => void;
  className?: string;
  type?: "button" | "submit" | "reset";
};

export default function RoundedButton({
  children,
  onClick,
  className = "",
  type = "button",
}: RoundedButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`px-6 py-2 rounded-full shadow transition cursor-pointer ${className}`}
    >
      {children}
    </button>
  );
}
