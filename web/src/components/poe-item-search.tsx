import type { AffixInfo, ItemData } from "@/App";
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

const PoeItemSearch = ({
  itemData,
  itemResults,
  setItemData,
  search,
  searchUI,
}: {
  itemData: ItemData;
  itemResults: TradeListing[];
  setItemData: (item: ItemData) => void;
  search: (e: unknown) => Promise<void>;
  searchUI: (e: unknown) => Promise<void>;
}) => {
  const handleRollChange = (affixIndex: number, newRoll: number) => {
    const newAffixs = [...(itemData.affixs ?? [])];
    newAffixs[affixIndex].roll = newRoll;
    setItemData({ ...itemData, affixs: newAffixs });
  };

  const handleCheckedChange = (affixIndex: number, checked: boolean) => {
    const newAffixs = [...(itemData.affixs ?? [])];
    newAffixs[affixIndex].checked = checked;
    setItemData({ ...itemData, affixs: newAffixs });
  };

  return (
    <>
      <CardHeader>
        <CardTitle className="text-xl font-bold">{itemData.name}</CardTitle>
        <div className="flex space-x-2">
          <Badge>{itemData.rarity}</Badge>
          <Badge variant="outline">{itemData.itemClass}</Badge>
        </div>
        {itemData.base && (
          <p className="text-xs text-muted-foreground">{itemData.base}</p>
        )}
        {itemData.type && (
          <p className="text-xs text-muted-foreground">{itemData.type}</p>
        )}
      </CardHeader>
      <CardContent>
        <ScrollArea className="w-full rounded-md border p-2">
          {itemData.affixs?.map((affixGroup, index) => (
            <div key={`group-${affixGroup.affix[0].poe_id}`}>
              {affixGroup.affix.map((affix) => (
                <Affix
                  key={affix.poe_id}
                  affix={affix}
                  roll={affixGroup.roll}
                  checked={affixGroup.checked}
                  onRollChange={(newRoll) => handleRollChange(index, newRoll)}
                  onCheckedChange={(checked) =>
                    handleCheckedChange(index, checked)
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
