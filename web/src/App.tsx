import { useEffect, useState } from "react";
import { Toaster, toast } from "sonner";
import PoeItemSearch from "./components/poe-item-search";
import { type TradeListing, lookup, openTradeQuery } from "./trade/trade";
import { api } from "./util/electron";

export type ItemData = {
  name: string;
  rarity: string;
  itemClass: string; // TODO create enum hehe
  base?: string; // todo create enum ehhe
  type?: string;
  quality?: number;
  stats?: ItemStat[];
  affixs?: {
    affix: AffixInfo[];
    roll: number;
  }[];
};

export type WithSearchConfig<T> = {
  [K in keyof T]: T[K] extends Array<infer U>
    ? Array<{ value: U; include: boolean }> // Apply value/include to each item in the array
    : T[K] extends object
      ? { value: WithSearchConfig<T[K]>; include: boolean }
      : { value: T[K]; include: boolean };
};

export type SearchCriteria<T> = Partial<WithSearchConfig<T>>;
export type ItemSearchCriteria = SearchCriteria<ItemData>;

export type ItemStat = {
  type: string;
  value: number;
};

export type AffixInfo = {
  common_name: string;
  poe_id: string;
  regex: RegExp;
  type: "EXPLICIT" | "IMPLICIT";
  rawText?: string;
};

const App = () => {
  const [itemData, setItemData] = useState<ItemSearchCriteria>();

  const [itemRes, setItemRes] = useState<TradeListing[]>([]);

  useEffect(() => {
    api.receive("item", (data: string) => {
      setItemData(undefined);
      setItemRes([]);

      const parsedData: ItemData = JSON.parse(data);

      const searchCriteria: ItemSearchCriteria = Object.keys(parsedData).reduce(
        (criteria, key) => {
          const typedKey = key as keyof ItemData;
          const value = parsedData[typedKey];

          // biome-ignore lint/suspicious/noExplicitAny: <explanation>
          (criteria as any)[typedKey] = {
            value: value,
            include: false,
          };

          return criteria;
        },
        {} as ItemSearchCriteria,
      );
    });
  }, []);

  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  const submitSearch = async (e: any) => {
    e.preventDefault();
    if (!itemData) return;

    setItemRes([]);
    const pendingData = toast.promise(lookup(itemData), {
      loading: "Loading...",
      success: "Done!",
      error: (data) => data,
    });
    const data = await pendingData.unwrap();
    if (data) setItemRes(data);
  };

  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  const submitTradeOpen = async (e: any) => {
    e.preventDefault();
    if (!itemData) return;

    await openTradeQuery(itemData);
  };

  return (
    <>
      <Toaster position="top-center" duration={1500} theme="dark" />

      {itemData && (
        <PoeItemSearch
          itemData={itemData}
          itemResults={itemRes}
          search={submitSearch}
          searchUI={submitTradeOpen}
          setItemData={setItemData}
        />
      )}
    </>
  );
};

export default App;
