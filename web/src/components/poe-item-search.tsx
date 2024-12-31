import { sanitize } from "@/parser/item-parser";
import type { TradeListing } from "@/trade/trade";
import type { AffixInfo, SearchableItemData } from "@/types/parser";
import { Globe, Search } from "lucide-react";
import ToggleBadge from "./toggle-badge";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { CardContent, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Checkbox } from "./ui/checkbox";
import { Input } from "./ui/input";
import { ScrollArea } from "./ui/scroll-area";
import { Separator } from "./ui/separator";

type AffixProps = {
  affix: AffixInfo;
  roll: number | undefined;
  checked: boolean;
  onRollChange: (newRoll: number) => void;
  onCheckedChange: (checked: boolean) => void;
};

const Affix = ({
  affix,
  roll,
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
      {roll && (
        <Input
          type="number"
          value={roll}
          onChange={(e) => onRollChange(Number(e.target.value))}
          className="w-16 h-6 text-xs"
          disabled={!checked}
        />
      )}
    </div>
  );
};

const SearchResultItem: React.FC<{ result: TradeListing }> = ({ result }) => {
  return (
    <div
      className="flex justify-between items-center py-1"
      title={sanitize(result.item.explicitMods?.join("\n") ?? "")}
    >
      <span className="text-sm">{result.listing.account.name}</span>
      <Badge variant="secondary">{`${result.listing.price.amount} ${result.listing.price.currency}`}</Badge>
    </div>
  );
};

type SearchableKeys = keyof SearchableItemData;

const PoeItemSearch = ({
  itemData,
  itemResults,
  setItemData,
  search,
  searchUI,
}: {
  itemData: SearchableItemData;
  itemResults: TradeListing[];
  setItemData: (item: SearchableItemData) => void;
  search: (e: React.MouseEvent<HTMLButtonElement>) => Promise<void>;
  searchUI: (e: React.MouseEvent<HTMLButtonElement>) => Promise<void>;
}) => {
  const handleRollChange = (
    affixType: "affixs" | "implicit" | "enchant",
    affixIndex: number,
    newRoll: number,
  ) => {
    const updateAffix = (key: "affixs" | "implicit" | "enchant") => {
      if (!itemData[key]) return;

      const updatedAffixes = [...itemData[key].value];
      updatedAffixes[affixIndex] = {
        ...updatedAffixes[affixIndex],
        roll: newRoll,
      };

      setItemData({
        ...itemData,
        [key]: { value: updatedAffixes },
      });
    };

    if (affixType === "affixs") {
      updateAffix("affixs");
    } else if (affixType === "implicit") {
      updateAffix("implicit");
    }
  };

  const handleIncludedChange = (
    key: SearchableKeys,
    included: boolean,
    arrayIndex?: number,
  ) => {
    if (!itemData[key]) return;

    // Handle array types (affixs, implicit, stats)
    if (Array.isArray(itemData[key]?.value)) {
      if (typeof arrayIndex !== "number") return;

      const updatedArray = [...itemData[key].value];
      updatedArray[arrayIndex] = {
        ...updatedArray[arrayIndex],
        included: included,
      };

      setItemData({
        ...itemData,
        [key]: { value: updatedArray },
      });
    }
    // Handle primitive types (name, rarity, itemClass, etc.)
    else {
      setItemData({
        ...itemData,
        [key]: {
          ...itemData[key],
          value: itemData[key].value,
          included: included,
        },
      });
    }
  };

  console.log(itemData);

  return (
    <>
      <CardHeader>
        <div className="py-2">
          <CardTitle className="text-xl font-bold text-center ">
            {itemData.name?.value}
          </CardTitle>
          {itemData.base && (
            <p className="text-xs text-muted-foreground text-center">
              {itemData.base?.value}
            </p>
          )}
        </div>

        <div className="flex gap-2 flex-wrap">
          <ToggleBadge
            isIncluded={itemData.rarity?.included ?? false}
            onClick={() =>
              handleIncludedChange("rarity", !itemData.rarity?.included)
            }
            value={itemData.rarity?.value ?? ""}
          />

          <ToggleBadge
            isIncluded={itemData.itemClass.included}
            onClick={() =>
              handleIncludedChange("itemClass", !itemData.itemClass.included)
            }
            value={itemData.itemClass.value}
          />

          {itemData.quality && (
            <ToggleBadge
              isIncluded={itemData.quality.included}
              onClick={() =>
                handleIncludedChange("quality", !itemData.quality?.included)
              }
              prefix="Q"
              value={itemData.quality.value}
            />
          )}

          {itemData.itemLevel && (
            <ToggleBadge
              isIncluded={itemData.itemLevel.included}
              onClick={() =>
                handleIncludedChange("itemLevel", !itemData.itemLevel?.included)
              }
              prefix="iLvl"
              value={itemData.itemLevel.value}
            />
          )}

          {itemData.areaLevel && (
            <ToggleBadge
              isIncluded={itemData.areaLevel.included}
              onClick={() =>
                handleIncludedChange("areaLevel", !itemData.areaLevel?.included)
              }
              prefix="Lvl"
              value={itemData.areaLevel.value}
            />
          )}

          {itemData.waystoneTier && (
            <ToggleBadge
              isIncluded={itemData.waystoneTier.included}
              onClick={() =>
                handleIncludedChange(
                  "waystoneTier",
                  !itemData.waystoneTier?.included,
                )
              }
              prefix="Tier"
              value={itemData.waystoneTier.value}
            />
          )}

          {itemData.numRuneSockets && (
            <ToggleBadge
              isIncluded={itemData.numRuneSockets.included}
              onClick={() =>
                handleIncludedChange(
                  "numRuneSockets",
                  !itemData.numRuneSockets?.included,
                )
              }
              prefix="Runes"
              value={itemData.numRuneSockets.value}
            />
          )}

          {itemData.stats?.value.map((stat, idx) => (
            <ToggleBadge
              key={stat.type}
              isIncluded={stat.included ?? false}
              onClick={() => handleIncludedChange("stats", !stat.included, idx)}
              prefix={stat.type}
              value={stat.value}
            />
          ))}
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {(itemData.enchant?.value.length ?? 0) > 0 && (
          <ScrollArea className="w-full rounded-md border p-2">
            <div className="text-sm font-semibold mb-1">Enchants</div>
            {itemData.enchant?.value.map((affixGroup, index) => (
              <div key={`group-${affixGroup.affix[0].poe_id}`}>
                {affixGroup.affix.map((affix) => (
                  <Affix
                    key={affix.poe_id}
                    affix={affix}
                    roll={affixGroup.roll}
                    checked={affixGroup.included} // Changed from checked to included
                    onRollChange={(newRoll) =>
                      handleRollChange("enchant", index, newRoll)
                    }
                    onCheckedChange={
                      (
                        included, // Changed parameter name to match
                      ) => handleIncludedChange("enchant", included, index) // Updated function name
                    }
                  />
                ))}
              </div>
            ))}
          </ScrollArea>
        )}

        {(itemData.implicit?.value.length ?? 0) > 0 && (
          <ScrollArea className="w-full rounded-md border p-2">
            <div className="text-sm font-semibold mb-1">Implicits</div>
            {itemData.implicit?.value.map((affixGroup, index) => (
              <div key={`group-${affixGroup.affix[0].poe_id}`}>
                {affixGroup.affix.map((affix) => (
                  <Affix
                    key={affix.poe_id}
                    affix={affix}
                    roll={affixGroup.roll}
                    checked={affixGroup.included} // Changed from checked to included
                    onRollChange={(newRoll) =>
                      handleRollChange("implicit", index, newRoll)
                    }
                    onCheckedChange={
                      (
                        included, // Changed parameter name to match
                      ) => handleIncludedChange("implicit", included, index) // Updated function name
                    }
                  />
                ))}
              </div>
            ))}
          </ScrollArea>
        )}

        {(itemData.affixs?.value.length ?? 0) > 0 && (
          <ScrollArea className="w-full rounded-md border p-2">
            <div className="text-sm font-semibold mb-1">Explicits</div>
            {itemData.affixs?.value.map((affixGroup, index) => (
              <div key={`group-${affixGroup.affix[0].poe_id}`}>
                {affixGroup.affix.map((affix) => (
                  <Affix
                    key={affix.poe_id}
                    affix={affix}
                    roll={affixGroup.roll}
                    checked={affixGroup.included} // Changed from checked to included
                    onRollChange={(newRoll) =>
                      handleRollChange("affixs", index, newRoll)
                    }
                    onCheckedChange={
                      (
                        included, // Changed parameter name to match
                      ) => handleIncludedChange("affixs", included, index) // Updated function name
                    }
                  />
                ))}
              </div>
            ))}
          </ScrollArea>
        )}
      </CardContent>
      <CardFooter className="flex space-x-2">
        <Button onClick={search} className="w-full">
          <Search />
          Search
        </Button>
        <Button onClick={searchUI} className="w-24">
          <Globe />
          Site
        </Button>
      </CardFooter>
      <CardContent>
        {itemResults.length > 0 && (
          <>
            <Separator className="my-2" />
            <div className="text-sm font-semibold mb-1">Search Results:</div>
            <ScrollArea className="w-full rounded-md border p-2">
              {itemResults.map((result) => (
                <SearchResultItem key={result.id} result={result} />
              ))}
            </ScrollArea>
          </>
        )}
      </CardContent>
    </>
  );
};

export default PoeItemSearch;
