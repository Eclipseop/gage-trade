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
  affixs?: {
    affix: AffixInfo[];
    roll: number;
    checked: boolean;
  }[];
};

export type AffixInfo = {
  common_name: string;
  poe_id: string;
  regex: RegExp;
  type: "EXPLICIT" | "IMPLICIT";
  rawText?: string;
};

const App = () => {
  const [mods, setMods] = useState<ItemData>();

  console.log(mods);
  const [itemRes, setItemRes] = useState<TradeListing[]>([]);

  useEffect(() => {
    api.receive("item", (data: string) => {
      setMods(undefined);
      setItemRes([]);

      const parsedData = JSON.parse(data) as ItemData;

      const updatedAffixs = parsedData.affixs?.map((affix) => ({
        ...affix,
        checked: false,
      }));

      setMods({ ...parsedData, affixs: updatedAffixs });
    });
  }, []);

  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  const submitSearch = async (e: any) => {
    e.preventDefault();
    if (!mods) return;

    setItemRes([]);
    const pendingData = toast.promise(lookup(mods), {
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
    if (!mods) return;

    await openTradeQuery(mods);
  };

  return (
    <>
      <Toaster position="top-center" duration={1500} theme="dark" />

      {mods && (
        <PoeItemSearch
          itemData={mods}
          itemResults={itemRes}
          search={submitSearch}
          searchUI={submitTradeOpen}
          setItemData={setMods}
        />
      )}
    </>
  );
};

export default App;
