import { useNavigate } from "react-router-dom";
import { Gauge, Home } from "lucide-react";
import Button from "../components/ui/Button";

export default function NotFound() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex items-center justify-center bg-ink-900 px-6">
      <div className="text-center max-w-sm">
        <div className="w-14 h-14 rounded-2xl bg-ignition-500/15 text-ignition-300 flex items-center justify-center mx-auto mb-5">
          <Gauge size={26} />
        </div>
        <p className="font-mono text-ignition-300 text-sm mb-2">Error 404</p>
        <h1 className="font-display font-semibold text-2xl text-white">This route doesn't exist</h1>
        <p className="text-white/50 text-sm mt-2 leading-relaxed">
          The page you're looking for has either moved or never existed. Let's get you back on the road.
        </p>
        <div className="mt-6">
          <Button icon={Home} onClick={() => navigate("/")}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}
