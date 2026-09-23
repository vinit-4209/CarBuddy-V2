import { SEVERITY_META } from "../../data/mockData";
import Badge from "../ui/Badge";
import { Circle } from "lucide-react";

export default function SeverityBadge({ severity }) {
  const meta = SEVERITY_META[severity] || SEVERITY_META.moderate;
  return (
    <Badge tone={meta.color} icon={Circle}>
      {meta.label} severity
    </Badge>
  );
}
