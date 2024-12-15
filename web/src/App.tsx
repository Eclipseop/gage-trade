import { useEffect, useState } from "react";
import { lookup, openTradeQuery } from "./trade/trade";
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
  const [itemRes, setItemRes] = useState<string[]>([]);

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
      console.log("xD");
      const items = await lookup(filteredMods);
      if (!items) {
        console.log("wjat the sigma? lookup returned undefined!!");
        return;
      }
      setItemRes(
        items.map(
          (i) => `${i.listing.price.amount} ${i.listing.price.currency}`,
        ),
      );
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
    <div className="flex flex-col mx-auto pt-2 px-2 text-neutral-100 bg-black min-h-screen">
      <span className="text-xl">
        {mods?.name} - <span className="font-semibold">{mods?.itemClass}</span>
      </span>

      <form className="flex flex-col space-y-2 text-sm">
        <div className="pl-1">
          {mods?.affixs.map((a, idx) => (
            <div
              key={a.affix[0].poe_id}
              className="space-x-1 flex items-center"
              onClick={() => toggleChecked(idx)}
              onKeyDown={() => toggleChecked(idx)}
            >
              <label>
                <input
                  type="checkbox"
                  checked={a.checked}
                  onChange={() => toggleChecked(idx)}
                />
                {a.affix[0].rawText}
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
      <span className="flex flex-col text-ms leading-tight">
        {itemRes.map((ir, idx) => (
          <span
            key={`res-${
              // biome-ignore lint/suspicious/noArrayIndexKey: replace this once i am returing better info
              idx
            }`}
          >
            {ir}
          </span>
        ))}
      </span>
    </div>
  );
};

export default App;
