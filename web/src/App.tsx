import { useEffect, useState } from "react";
import { Toaster, toast } from "sonner";
import { type TradeListing, lookup, openTradeQuery } from "./trade/trade";
import { api } from "./util/electron";

export type ItemData = {
  name: string;
  rarity: string;
  itemClass: string; // TODO create enum hehe
  base: string; // todo create enum ehhe
  affixs: {
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
  const [itemRes, setItemRes] = useState<TradeListing>([]);

  useEffect(() => {
    api.receive("item", (data: string) => {
      setMods(undefined);
      setItemRes([]);

      const parsedData = JSON.parse(data) as ItemData;

      const updatedAffixs = parsedData.affixs.map((affix) => ({
        ...affix,
        checked: true, // Set default checked to true
      }));

      setMods({ ...parsedData, affixs: updatedAffixs });
    });
  }, []);

  const toggleChecked = (affixIndex: number) => {
    const existingMods = JSON.parse(JSON.stringify(mods));
    console.log("yo", affixIndex, existingMods.affixs[affixIndex].checked);
    existingMods.affixs[affixIndex].checked =
      !existingMods?.affixs[affixIndex].checked;
    setMods(existingMods);
  };

  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  const submitSearch = async (e: any) => {
    e.preventDefault();
    if (mods) {
      const filteredMods = {
        ...mods,
        affixs: mods.affixs.filter((affix) => affix.checked),
      };

      const pendingData = toast.promise(lookup(filteredMods), {
        loading: "Loading...",
        success: "Done!",
        error: (data) => data,
      });
      const data = await pendingData.unwrap();
      if (data) setItemRes(data);
    }
  };

  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  const submitTradeOpen = async (e: any) => {
    e.preventDefault();
    if (mods) {
      const filteredMods = {
        ...mods,
        affixs: mods.affixs.filter((affix) => affix.checked),
      };

      await openTradeQuery(filteredMods);
    }
  };

  return (
    <>
      <Toaster position="top-center" duration={1500} />
      <div className="flex flex-col mx-auto pt-2 px-2 text-neutral-200 bg-black min-h-screen font-serif">
        <span className="text-xl">
          {mods?.name} -{" "}
          <span className="font-semibold">{mods?.itemClass}</span>
        </span>

        <form className="flex flex-col space-y-2 text-sm">
          <div className="pl-1 grid grid-cols-2">
            {mods?.affixs.map((a, idx) => (
              <div
                key={a.affix[0].poe_id}
                className="space-x-1 flex items-center"
              >
                <label>
                  <input
                    type="checkbox"
                    checked={a.checked}
                    onChange={() => toggleChecked(idx)}
                    className="cursor-pointer"
                  />
                  <span>{a.affix[0].rawText}</span>
                </label>
              </div>
            ))}
          </div>

          <div className="flex space-x-1">
            <button
              type="button"
              className="px-3 py-1 bg-black border border-white hover:bg-white hover:text-black rounded text-white w-full"
              onClick={submitSearch}
            >
              Submit
            </button>
            <button
              type="button"
              className="px-3 py-1 bg-black border border-white hover:bg-white hover:text-black rounded text-white"
              onClick={submitTradeOpen}
            >
              Trade
            </button>
          </div>
        </form>
        <span className="flex flex-col text-sm pt-1">
          {itemRes.map((ir) => (
            <div
              className="flex flex-row justify-between leading-tight"
              key={ir.id}
            >
              <span>
                {ir.listing.price.amount} {ir.listing.price.currency}
              </span>
              <span className="text-xs text-neutral-500">
                {ir.listing.account.name}
              </span>
            </div>
          ))}
        </span>
      </div>
    </>
  );
};

export default App;
