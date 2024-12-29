import { Badge } from "./ui/badge";

type ToggleBadgeProps = {
  isIncluded: boolean;
  onClick: () => void;
  prefix?: string;
  value: string | number;
  className?: string;
};

const ToggleBadge = ({
  isIncluded,
  onClick,
  prefix = "",
  value,
  className = "",
}: ToggleBadgeProps) => {
  return (
    <Badge
      variant={isIncluded ? "default" : "outline"}
      className={`cursor-pointer ${className}`}
      onClick={onClick}
    >
      {prefix && `${prefix}: `}
      {value}
    </Badge>
  );
};

export default ToggleBadge;
