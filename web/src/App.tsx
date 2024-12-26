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
    checked: boolean;
  }[];
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

const App = () => {
  const [itemData, setItemData] = useState<ItemData>();

  console.log(itemData);
  const [itemRes, setItemRes] = useState<TradeListing[]>([]);

  useEffect(() => {
    api.receive("item", (data: string) => {
      setItemData(undefined);
      setItemRes([]);

      const parsedData = JSON.parse(data) as ItemData;

      const updatedAffixs = parsedData.affixs?.map((affix) => ({
        ...affix,
        checked: false,
      }));

      setItemData({ ...parsedData, affixs: updatedAffixs });
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
