import TradeStatsFetcher from "./trade/trade-stats";

const ITEM_SECTION_MARKET = "--------";

export type ItemData = {
  name: string;
  rarity: string;
  itemClass: string; // TODO create enum hehe
  base: string; // todo create enum ehhe
  affixs: {
    affix: AffixInfo[];
    roll: number;
  }[];
};

export type AffixInfo = {
  common_name: string;
  poe_id: string;
  regex: RegExp;
  type: "EXPLICIT" | "IMPLICIT";
};

export const parse = async (itemData: string): Promise<ItemData> => {
  console.log(itemData);
  const itemDataParts = itemData.split(ITEM_SECTION_MARKET);
  const fetcher = TradeStatsFetcher.getInstance();

  const parseData = { affixs: [] } as unknown as ItemData;

  for (let i = 0; i < itemDataParts.length; i++) {
    const section = itemDataParts[i];
    if (i === itemDataParts.length - 1) {
      // we're in the affix section hehe
      for (let x of section.split("\n")) {
        console.log(x);
        const rolls = x.match(/\d+(?:\.\d+)?/g);
        if (!rolls) continue;

        const roll =
          rolls.map(Number).reduce((sum, num) => sum + num, 0) / rolls.length;

        const itemStats = await fetcher.fetchTradeStats();

        const explicitMods = itemStats.result[0].entries.map((em) => {
          return {
            ...em,
            mappedRegex: new RegExp(
              em.text
                .replace(/\[([^\]]+)\]/g, (match, group: string) => {
                  const sortedElements = group
                    .split(",")
                    .map((el: string) => el.trim())
                    .sort((a, b) => a.length - b.length);
                  return `(${sortedElements.join("|")})`;
                })
                .replaceAll("+", "\\+")
                .replaceAll("#", "\\d+")
            ),
          };
        });
        // console.log(explicitMods.filter((em) => em.text.includes("Damage to")));
        let matchedMods = [] as AffixInfo[];
        for (const explicitMod of explicitMods) {
          const execedRegex = explicitMod.mappedRegex.exec(x);
          // console.log(execedRegex);
          if (explicitMod.mappedRegex.exec(x) != null) {
            // console.log(execedRegex);
            // console.log(
            //   execedRegex?.[0] === x.replace("\r", "").replace("+", "")
            // );
            console.log(
              `matched using ${explicitMod.mappedRegex}, poe_id: ${explicitMod.id}`
            );
            matchedMods.push({
              common_name: "idk hehe",
              type: "EXPLICIT",
              regex: explicitMod.mappedRegex,
              poe_id: explicitMod.id,
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

  return parseData as ItemData;
};
