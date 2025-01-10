import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import PoeItemSearch from "./components/poe-item-search";
import { isPoeItem, parse } from "./parser/item-parser";
import { type TradeListing, tradeApi } from "./trade/trade";
import type { ParsedItemData, SearchableItemData } from "./types/parser";
import { getApi } from "./util/electron";

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

const Search = () => {
  const [itemData, setItemData] = useState<SearchableItemData>();
  const [itemRes, setItemRes] = useState<TradeListing[]>([]);
  const isSetup = useRef(false);

  useEffect(() => {
    if (!isSetup.current) {
      const api = getApi();

      api.send("get-settings", {});
      api.receive("settings-data", (data: string) => {
        console.log("settings", data, JSON.parse(data).league);
        tradeApi.setLeague(JSON.parse(data).league);
      });

      api.receive("item-check", async (data: string) => {
        console.log("item-check triggered");
        api.send("item-check", isPoeItem(data[0]));
      });

      api.receive("item", async (data: string) => {
        console.log("item received", data[0]);
        setItemData(undefined);
        setItemRes([]);

        const parsedData = await parse(data[0]);
        const l = toSearchableItemData(parsedData);
        setItemData(l);
      });

      isSetup.current = true;
    }
  }, []);

  const submitSearch = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (!itemData) return;

    setItemRes([]);
    const pendingData = toast.promise(tradeApi.lookup(itemData), {
      loading: "Loading...",
      success: "Done!",
      error: (data) => data,
    });
    const data = await pendingData.unwrap();
    if (data) setItemRes(data);
  };

  const submitTradeOpen = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (!itemData) return;

    await tradeApi.openTradeQuery(itemData);
  };

  return (
    <>
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

export default Search;
