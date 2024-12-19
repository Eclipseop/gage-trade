import AffixInfoFetcher from "./trade/affix-info";

const ITEM_SECTION_MARKER = "--------";

export type ParsedItemData = {
  name: string;
  rarity?: string;
  itemClass: string;
  base?: string;
  affixs?: {
    affix: Affix[];
    roll: number | undefined;
  }[];
};

export type Affix = {
  poe_id: string;
  regex: RegExp;
  type: "EXPLICIT" | "IMPLICIT";
  rawText?: string;
};

const fetcher = AffixInfoFetcher.getInstance();

// TODO think of a non cringe way of doing this haha
const getExplicitSectionIdx = (itemRarity: string, sections: string[]) => {
  let idx = -1;
  for (let i = 0; i < sections.length; i++) {
    const section = sections[i];

    const appendage =
      section.includes("Corrupted") ||
      section.includes("Note: ") ||
      section.includes("allocated Jewel Socket");

    if (!appendage) idx = i;
  }
  if (itemRarity === "Unique") {
    idx = idx - 1;
  }
  return idx;
};

const getItemRarity = (itemData: string): string | undefined => {
  const lines = itemData.split("\n");
  for (const line of lines) {
    if (line.includes("Rarity")) {
      const regex = /(Normal|Magic|Rare|Unique|Currency)/g;
      const matches = line.match(regex);
      return matches?.[0];
    }
  }
  return undefined;
};

const getItemClass = (itemData: string): string | undefined => {
  const lines = itemData.split("\n");
  for (const line of lines) {
    if (line.includes("Item Class")) {
      const regex = /(?<=Item Class: )[A-z ]+/g;
      const matches = line.match(regex);
      return matches?.[0];
    }
  }
  return undefined;
};

// I'm sure there is a better way of doing this...
const isPoeItem = (itemData: string): boolean => {
  return itemData.split(ITEM_SECTION_MARKER).length >= 3;
};

export const parse = async (itemData: string): Promise<ParsedItemData> => {
  if (!isPoeItem(itemData)) return Promise.reject("Not a Poe Item");

  const itemDataParts = itemData.split(ITEM_SECTION_MARKER);

  const itemStats = await fetcher.fetchAffixInfo();
  const parseData = { affixs: [] } as unknown as ParsedItemData;

  const itemClass = getItemClass(itemData);
  if (!itemClass) throw new Error("Unable to determine item class");

  const itemRarity = getItemRarity(itemData);
  if (!itemRarity) throw new Error("Unable to determine item rarity!");

  if (itemClass === "Stackable Currency") {
    const sec = itemDataParts[0].split("\r\n").filter((s) => s.length > 0);
    return {
      name: sec[sec.length - 1],
      itemClass: itemClass,
      rarity: itemRarity,
    };
  }

  const explicitSectionIdx = getExplicitSectionIdx(itemRarity, itemDataParts);
  for (let i = 0; i < itemDataParts.length; i++) {
    const section = itemDataParts[i];
    if (i === explicitSectionIdx) {
      // we're in the affix section hehe
      for (const x of section.split("\n")) {
        if (x.trim() === "") continue;
        const rolls = x.match(/\d+(?:\.\d+)?/g);

        const roll = rolls
          ? rolls.map(Number).reduce((sum, num) => sum + num, 0) / rolls.length
          : undefined;

        const matchedMods = [] as Affix[];
        for (const explicitMod of itemStats) {
          if (explicitMod.mappedRegex.exec(x.replace("\r", "")) != null) {
            console.log(
              `${x} matched using ${explicitMod.mappedRegex}, poe_id: ${explicitMod.id}`,
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
        parseData.affixs?.push({ roll: roll, affix: matchedMods });

        console.log("\n");
      }
    }

    if (section.includes("Rarity: ")) {
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
