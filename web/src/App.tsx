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
  implicit?: RollableSearchableAffix[];
  affixs?: RollableSearchableAffix[];
};

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

type Searchable = { included: boolean };
type Rollable = { roll: number };
export type RollableSearchableAffix = { affix: AffixInfo[] } & Rollable &
  Searchable;

type SearchableValue<T> = {
  value: T;
  included: boolean;
};

export type SearchableArray<T> = {
  value: (T & { included: boolean })[];
};

export type SearchableItemData = {
  [K in keyof ItemData]: ItemData[K] extends (infer U)[]
    ? SearchableArray<U>
    : SearchableValue<NonNullable<ItemData[K]>>;
};

const toSearchableItemData = (item: ItemData): SearchableItemData => {
  const result = {} as SearchableItemData;

  for (const key of Object.keys(item) as (keyof ItemData)[]) {
    const value = item[key];

    if (value === undefined) continue;

    if (Array.isArray(value)) {
      //@ts-expect-error
      result[key] = {
        value: value.map((item) => ({
          ...item,
          included: false,
        })),
      } as SearchableItemData[keyof ItemData];
    } else {
      //@ts-expect-error
      result[key] = {
        value,
        included: false,
      } as SearchableItemData[keyof ItemData];
    }
  }

  return result;
};

const App = () => {
  const [itemData, setItemData] = useState<SearchableItemData>();

  const [itemRes, setItemRes] = useState<TradeListing[]>([]);

  useEffect(() => {
    api.receive("item", (data: string) => {
      setItemData(undefined);
      setItemRes([]);

      const parsedData: ItemData = JSON.parse(data);

      const l = toSearchableItemData(parsedData);
      console.log(l);
      setItemData(l);
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
