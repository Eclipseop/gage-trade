import { useEffect, useState } from "react";
import { Toaster, toast } from "sonner";
import PoeItemSearch from "./components/poe-item-search";
import { parse } from "./trade/item-parser";
import { type TradeListing, lookup, openTradeQuery } from "./trade/trade";
import type { ParsedItemData, SearchableItemData } from "./types/parser";
import { api } from "./util/electron";

const toSearchableItemData = (item: ParsedItemData): SearchableItemData => {
  const result = {} as SearchableItemData;

  for (const key of Object.keys(item) as (keyof ParsedItemData)[]) {
    const value = item[key];

    if (value === undefined) continue;

    if (Array.isArray(value)) {
      //@ts-expect-error
      result[key] = {
        value: value.map((item) => ({
          ...item,
          included: false,
        })),
      } as SearchableItemData[keyof ParsedItemData];
    } else {
      //@ts-expect-error
      result[key] = {
        value,
        included: false,
      } as SearchableItemData[keyof ParsedItemData];
    }
  }

  return result;
};

const App = () => {
  const [itemData, setItemData] = useState<SearchableItemData>();

  const [itemRes, setItemRes] = useState<TradeListing[]>([]);

  useEffect(() => {
    api.receive("item", async (data: string) => {
      console.log("um hello???");
      setItemData(undefined);
      setItemRes([]);

      const parsedData = await parse(data[0]);

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
