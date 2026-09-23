export default function Card({ children, className = "", padded = true, hover = false, as: As = "div", ...props }) {
  return (
    <As
      className={`bg-white border border-mist-200 rounded-2xl shadow-panel ${padded ? "p-5" : ""} ${hover ? "transition-shadow hover:shadow-lift" : ""} ${className}`}
      {...props}
    >
      {children}
    </As>
  );
}
