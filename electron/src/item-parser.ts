import AffixInfoFetcher from "./trade/affix-info";

const ITEM_SECTION_MARKER = "--------";

export type ParsedItemData = {
  name: string;
  rarity?: string;
  itemClass: string;
  base?: string;
  affixs?: {
    affix: MappedAffix[];
    roll: number | undefined;
  }[];
};

type MappedAffix = {
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

export const parse = async (itemString: string): Promise<ParsedItemData> => {
  if (!isPoeItem(itemString)) return Promise.reject("Not a Poe Item");

  const itemSections = itemString.split(ITEM_SECTION_MARKER);

  const affixInfo = await fetcher.fetchAffixInfo();
  const parseData = { affixs: [] } as unknown as ParsedItemData;

  const itemClass = getItemClass(itemString);
  if (!itemClass) throw new Error("Unable to determine item class");

  const itemRarity = getItemRarity(itemString);
  if (!itemRarity) throw new Error("Unable to determine item rarity!");

  if (itemRarity === "Currency") {
    const lines = itemSections[0].split("\n").filter((s) => s.length > 0);
    return {
      name: lines[lines.length - 1],
      itemClass: itemClass,
      rarity: itemRarity,
    };
  }

  const explicitSectionIdx = getExplicitSectionIdx(itemRarity, itemSections);
  for (let i = 0; i < itemSections.length; i++) {
    const section = itemSections[i];
    if (i === explicitSectionIdx) {
      // we're in the affix section hehe
      for (const x of section.split("\n")) {
        if (x.trim() === "") continue;
        const rolls = x.match(/\d+(?:\.\d+)?/g);

        const roll = rolls
          ? rolls.map(Number).reduce((sum, num) => sum + num, 0) / rolls.length
          : undefined;

        const matchedAffix = [] as MappedAffix[];
        for (const affix of affixInfo) {
          if (affix.mappedRegex.exec(x.replace("\r", "")) != null) {
            console.log(
              `${x} matched using ${affix.mappedRegex}, poe_id: ${affix.id}`,
            );
            matchedAffix.push({
              type: "EXPLICIT",
              regex: affix.mappedRegex,
              poe_id: affix.id,
              rawText: x,
            });
          }
        }
        if (matchedAffix.length === 0) {
          throw new Error(`COULD NOT MATCH ${x}`);
        }
        parseData.affixs?.push({ roll: roll, affix: matchedAffix });

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
