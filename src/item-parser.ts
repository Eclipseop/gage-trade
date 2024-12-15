import TradeStatsFetcher from "./trade/trade-stats";

const ITEM_SECTION_MARKET = "--------";

export type ParsedItemData = {
  name: string;
  rarity: string;
  itemClass: string; // TODO create enum hehe
  base: string; // todo create enum ehhe
  affixs: {
    affix: Affix[];
    roll: number;
  }[];
};

export type Affix = {
  poe_id: string;
  regex: RegExp;
  type: "EXPLICIT" | "IMPLICIT";
  rawText?: string;
};

const getLastSection = (sections: string[]) => {
  let idx = -1;
  for (let i = 0; i < sections.length; i++) {
    const section = sections[i];
    if (!section.includes("Corrupted")) idx = i;
  }
  return idx;
};

export const parse = async (itemData: string): Promise<ParsedItemData> => {
  const itemDataParts = itemData.split(ITEM_SECTION_MARKET);
  const fetcher = TradeStatsFetcher.getInstance();
  const itemStats = await fetcher.fetchTradeStats();
  const parseData = { affixs: [] } as unknown as ParsedItemData;

  const nonCorruptSection = getLastSection(itemDataParts);

  for (let i = 0; i < itemDataParts.length; i++) {
    const section = itemDataParts[i];
    if (i === nonCorruptSection) {
      // we're in the affix section hehe
      for (const x of section.split("\n")) {
        console.log(x);
        const rolls = x.match(/\d+(?:\.\d+)?/g);
        if (!rolls) continue;

        const roll =
          rolls.map(Number).reduce((sum, num) => sum + num, 0) / rolls.length;

        const matchedMods = [] as Affix[];
        for (const explicitMod of itemStats) {
          if (explicitMod.mappedRegex.exec(x.replace("\r", "")) != null) {
            console.log(
              `matched using ${explicitMod.mappedRegex}, poe_id: ${explicitMod.id}`
            );
            matchedMods.push({
              type: "EXPLICIT",
              regex: explicitMod.mappedRegex,
              poe_id: explicitMod.id,
              rawText: x,
            });
          }
        }
        if (matchedMods.length === 0) {
          throw new Error(`COULD NOT MATCH ${x}`);
        }
        parseData.affixs.push({ roll: roll, affix: matchedMods });

        console.log("\n");
      }
    }

    if (section.includes("Rarity")) {
      const sectionParts = section.split("\n").filter((i) => i.length > 0);

      for (let x = 0; x < sectionParts.length; x++) {
        const s = sectionParts[x].replace("\r", "");
        switch (x) {
          case 0:
            parseData.itemClass = s.replace("Item Class: ", "");
            break;
          case 1:
            parseData.rarity = s.replace("Rarity: ", "");
            break;
          case 2:
            parseData.name = s;
            break;
          case 3:
            parseData.base = s;
            break;
        }
      }
    }
  }

  return parseData;
};
