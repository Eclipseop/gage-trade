import { type ChangeEvent, useEffect, useState } from "react";
import { Toaster, toast } from "sonner";
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
  const [itemRes, setItemRes] = useState<TradeListing>([]);

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

  const toggleChecked = (affixIndex: number) => {
    const existingMods = JSON.parse(JSON.stringify(mods));
    existingMods.affixs[affixIndex].checked =
      !existingMods?.affixs[affixIndex].checked;
    setMods(existingMods);
  };

  const updateRoll = (e: ChangeEvent<HTMLInputElement>, idx: number) => {
    const existingMods: ItemData = JSON.parse(JSON.stringify(mods));

    if (existingMods.affixs?.[idx]) {
      existingMods.affixs[idx].roll = Number(e.target.value);
      setMods(existingMods);
    }
  };

  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  const submitSearch = async (e: any) => {
    e.preventDefault();
    if (!mods) return;

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
      <div className="flex flex-col mx-auto pt-2 px-2 text-neutral-200 bg-black min-h-screen font-serif">
        <span className="text-xl">
          {mods?.name} -{" "}
          <span className="font-semibold">{mods?.itemClass}</span>
        </span>

        <form className="flex flex-col space-y-2 text-sm">
          <div className="grid grid-cols-2 gap-1">
            {mods?.affixs?.map((a, idx) => (
              <div
                key={a.affix[0].poe_id}
                className="space-x-1 flex items-center justify-between"
              >
                <label className="flex space-x-1">
                  <input
                    type="checkbox"
                    checked={a.checked}
                    onChange={() => toggleChecked(idx)}
                    className="cursor-pointer"
                  />
                  <span>{a.affix[0].rawText}</span>
                </label>

                <input
                  type="number"
                  value={a.roll}
                  onChange={(e) => updateRoll(e, idx)}
                  className="w-10 px-1 py-[2px] leading-none bg-black border rounded"
                />
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
