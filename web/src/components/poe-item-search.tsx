import type { AffixInfo, SearchableItemData } from "@/App";
import type { TradeListing } from "@/trade/trade";
import { Globe, Search } from "lucide-react";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { CardContent, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Checkbox } from "./ui/checkbox";
import { Input } from "./ui/input";
import { ScrollArea } from "./ui/scroll-area";
import { Separator } from "./ui/separator";

type AffixProps = {
  affix: AffixInfo;
  roll: number;
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
      <Input
        type="number"
        value={roll}
        onChange={(e) => onRollChange(Number(e.target.value))}
        className="w-16 h-6 text-xs"
        disabled={!checked}
      />
    </div>
  );
};

const SearchResultItem: React.FC<{ result: TradeListing }> = ({ result }) => {
  return (
    <div className="flex justify-between items-center py-1">
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
  search: (e: unknown) => Promise<void>;
  searchUI: (e: unknown) => Promise<void>;
}) => {
  const handleRollChange = (
    affixType: "affixs" | "implicit",
    affixIndex: number,
    newRoll: number,
  ) => {
    const updateAffix = (key: "affixs" | "implicit") => {
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

  return (
    <>
      <CardHeader>
        <CardTitle className="text-xl font-bold">
          {itemData.name?.value}
        </CardTitle>
        <div className="flex space-x-2">
          <Badge
            variant={itemData.rarity.included ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() =>
              handleIncludedChange("rarity", !itemData.rarity.included)
            }
          >
            {itemData.rarity?.value}
          </Badge>
          <Badge
            variant={itemData.itemClass.included ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() =>
              handleIncludedChange("itemClass", !itemData.itemClass.included)
            }
          >
            {itemData.itemClass?.value}
          </Badge>

          {itemData.quality && (
            <Badge
              variant={itemData.quality.included ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() =>
                handleIncludedChange("quality", !itemData.quality?.included)
              }
            >
              Q: {itemData.quality?.value}
            </Badge>
          )}
        </div>
        {itemData.base && (
          <p className="text-xs text-muted-foreground">
            {itemData.base?.value}
          </p>
        )}
        {itemData.type && (
          <p className="text-xs text-muted-foreground">
            {itemData.type?.value}
          </p>
        )}
      </CardHeader>
      <CardContent className="space-y-2">
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

        <ScrollArea className="w-full rounded-md border p-2">
          {(itemData.affixs?.value.length ?? 0) > 0 && ( // Changed to check value array
            <div className="text-sm font-semibold mb-1">Explicits</div>
          )}

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
