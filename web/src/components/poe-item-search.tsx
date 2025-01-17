import { sanitize } from "@/parser/item-parser";
import type { TradeListing } from "@/trade/trade";
import type { ItemStat, SearchableItemData } from "@/types/parser";
import dayjs from "dayjs";
import { Globe, Search } from "lucide-react";
import Affix from "./affix";
import ToggleBadge from "./toggle-badge";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { CardContent, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { ScrollArea } from "./ui/scroll-area";
import { Separator } from "./ui/separator";

function getTimeDifference(dateString: string) {
  const now = dayjs();
  const compareDate = dayjs(dateString);
  const diffMs = now.diff(compareDate, "millisecond");

  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (days > 0) return `${days}d`;

  const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  if (hours > 0) return `${hours}hr`;

  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  if (minutes > 0) return `${minutes}m`;

  return "0m";
}

const SearchResultItem: React.FC<{ result: TradeListing }> = ({ result }) => {
  return (
    <div
      className="flex justify-between items-center py-1"
      title={sanitize(result.item.explicitMods?.join("\n") ?? "")}
    >
      <span className="text-sm">{result.listing.account.name}</span>

      <div className="space-x-2">
        <Badge variant="outline">{`${getTimeDifference(
          result.listing.indexed,
        )}`}</Badge>

        <Badge variant="secondary">{`${result.listing.price.amount} ${result.listing.price.currency}`}</Badge>
      </div>
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
    type: "min" | "max",
  ) => {
    const updateAffix = (key: "affixs" | "implicit" | "enchant") => {
      if (!itemData[key]) return;

      const updatedAffixes = [...itemData[key].value];
      updatedAffixes[affixIndex] = {
        ...updatedAffixes[affixIndex],
        range: {
          ...updatedAffixes[affixIndex].range,
          [type]: newRoll,
        },
      };
      console.log("updating to ", newRoll);

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

  const statTypePrefixMap = {
    "physical-damage-dps": "pDPS",
    "energy-shield": "ES",
    "total-dps": "DPS",
    "total-edps": "eDPS",
    "attacks-per-second": "APS",
    "crit-chance": "Crit %",
    "reload-time": "Reload",
  } as const;

  const exclusionRules = {
    "total-edps": ["cold-", "fire-", "lightning-", "elemental-"],
    "physical-damage-dps": ["physical-damage"],
  };

  const shouldShowStat = (currentStat: ItemStat, allStats: ItemStat[]) => {
    // Check if any stat that would exclude this one is present
    for (const [exclusionTrigger, excludedPrefixes] of Object.entries(
      exclusionRules,
    )) {
      const triggerExists = allStats.some(
        (stat) => stat.type === exclusionTrigger,
      );

      if (triggerExists) {
        if (currentStat.type === exclusionTrigger) {
          return true;
        }

        // Check if current stat starts with any excluded prefix
        const isExcluded = excludedPrefixes.some((prefix) =>
          currentStat.type.startsWith(prefix),
        );
        if (isExcluded) return false;
      }
    }
    return true;
  };

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

          {itemData.stats?.value.map((stat, idx) => {
            if (!shouldShowStat(stat, itemData.stats?.value ?? [])) {
              console.log("FILTERING OUT!", stat);
              return null;
            }

            return (
              <ToggleBadge
                key={stat.type}
                isIncluded={stat.included ?? false}
                onClick={() =>
                  handleIncludedChange("stats", !stat.included, idx)
                }
                prefix={
                  statTypePrefixMap[
                    stat.type as keyof typeof statTypePrefixMap
                  ] ?? stat.type
                }
                value={stat.value}
              />
            );
          })}
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
                    min={affixGroup.range.min}
                    max={affixGroup.range.max}
                    checked={affixGroup.included} // Changed from checked to included
                    onRollChange={(newRoll, type: "min" | "max") =>
                      handleRollChange("enchant", index, newRoll, type)
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
                    min={affixGroup.range.min}
                    max={affixGroup.range.max}
                    checked={affixGroup.included} // Changed from checked to included
                    onRollChange={(newRoll, type: "min" | "max") =>
                      handleRollChange("implicit", index, newRoll, type)
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
                    min={affixGroup.range.min}
                    max={affixGroup.range.max}
                    checked={affixGroup.included} // Changed from checked to included
                    onRollChange={(newRoll, type: "min" | "max") =>
                      handleRollChange("affixs", index, newRoll, type)
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
