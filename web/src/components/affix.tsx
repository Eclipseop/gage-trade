import type { AffixInfo } from "@/types/parser";
import { Checkbox } from "./ui/checkbox";
import { Input } from "./ui/input";

type AffixProps = {
  affix: AffixInfo;
  roll: number | undefined;
  min: number | undefined;
  max: number | undefined;
  checked: boolean;
  onRollChange: (newRoll: number, type: "min" | "max") => void;
  onCheckedChange: (checked: boolean) => void;
};

const Affix = ({
  affix,
  roll,
  min,
  max,
  checked,
  onRollChange,
  onCheckedChange,
}: AffixProps) => {
  return (
    <div className="flex items-center justify-between py-1">
      <div className="flex items-center space-x-2 flex-grow">
        <Checkbox
          checked={checked}
          onCheckedChange={onCheckedChange}
          id={`checkbox-${affix.poe_id}`}
        />
        <label
          htmlFor={`checkbox-${affix.poe_id}`}
          className={`text-sm ${
            checked ? "text-foreground" : "text-muted-foreground"
          }`}
        >
          {affix.rawText}
        </label>
      </div>
      {roll !== undefined && (
        <div className="flex">
          <Input
            type="number"
            value={min}
            onChange={(e) => onRollChange(Number(e.target.value), "min")}
            className="w-16 h-6 text-xs rounded-r-none"
            disabled={!checked}
          />
          <Input
            type="number"
            value={max}
            onChange={(e) => onRollChange(Number(e.target.value), "max")}
            className="w-16 h-6 text-xs rounded-l-none"
            disabled={!checked}
          />
        </div>
      )}
    </div>
  );
};

export default Affix;
