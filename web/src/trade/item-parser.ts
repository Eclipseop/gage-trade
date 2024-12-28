import type { AffixInfo, ItemStat, ParsedItemData } from "@/types/parser";
import AffixInfoFetcher, { type Entry } from "./affix-info";

const ITEM_SECTION_MARKER = "--------";

const fetcher = AffixInfoFetcher.getInstance();

// TODO think of a non cringe way of doing this haha
const getExplicitSectionIdx = (
  itemRarity: string,
  itemClass: string,
  sections: string[],
) => {
  let idx = -1;

  if (itemClass === "Tablet") {
    return -1;
  }
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
  if (itemClass === "Quivers") {
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

const getQuality = (itemData: string): number | undefined => {
  for (const line of itemData.split("\n")) {
    if (line.startsWith("Quality: +")) {
      return Number(line.match(/\d+/)?.[0]);
    }
  }
  return undefined;
};

const getAreaLevel = (itemData: string): number | undefined => {
  for (const line of itemData.split("\n")) {
    if (line.startsWith("Area Level: ")) {
      return Number(line.match(/\d+/)?.[0]);
    }
  }
  return undefined;
};

const getItemLevel = (itemData: string): number | undefined => {
  for (const line of itemData.split("\n")) {
    if (line.startsWith("Item Level: ")) {
      return Number(line.match(/\d+/)?.[0]);
    }
  }
  return undefined;
};

const getItemStats = (itemData: string): ItemStat[] => {
  const arr: ItemStat[] = [];
  const addStat = (line: string, type: string, regex: string) => {
    if (line.startsWith(regex)) {
      const rolls = line.match(/\d+(?:\.\d+)?/g);

      const roll = rolls
        ? rolls.map(Number).reduce((sum, num) => sum + num, 0) / rolls.length
        : undefined;

      if (roll) {
        arr.push({
          type,
          value: Number(roll),
        });
      }
    }
  };

  for (const line of itemData.split("\n")) {
    addStat(line, "armour", "Armour");
    addStat(line, "evasion", "Evasion Rating");
    addStat(line, "energy-shield", "Energy Shield");
    addStat(line, "spirit", "Spirit");
    addStat(line, "physical-damage", "Physical Damage");
    addStat(line, "cold-damage", "Cold Damage");
    addStat(line, "fire-damage", "Fire Damage");
    addStat(line, "lightning-damage", "Lightning Damage");
    addStat(line, "crit-chance", "Critical Hit Chance");
    addStat(line, "attacks-per-second", "Attacks per Second");
    addStat(line, "reload-time", "Reload Time");
  }
  return arr;
};

// I'm sure there is a better way of doing this...
export const isPoeItem = (itemData: string): boolean => {
  return itemData.split(ITEM_SECTION_MARKER).length >= 3;
};

interface AffixMatch {
  text: string;
  affix: Entry & { mappedRegex: RegExp };
}

const findAffixMatches = (
  text: string,
  affixes: (Entry & { mappedRegex: RegExp })[],
): AffixMatch[] => {
  const matches: AffixMatch[] = [];
  const textToProcess = text.trim();

  if (textToProcess === "") return matches;

  let remainingText = textToProcess;

  while (remainingText.length > 0) {
    for (const affix of affixes) {
      const regex = new RegExp(affix.mappedRegex.source, "gm");
      const match = regex.exec(remainingText);

      if (match) {
        matches.push({
          text: match[0],
          affix: affix,
        });

        remainingText = remainingText.replace(match[0], "").trim();

        break;
      }
    }
  }

  return matches;
};

/*
An idea on how to solve affixes that have new line:

Once we konw we have the explicit section, DO NOT pslit it into new lines,
use regex to match on the entire section and add the matches into an array
May need to use m regex flag

If needed, we could remove the text once it is matched.
*/
export const parse = async (itemString: string): Promise<ParsedItemData> => {
  if (!isPoeItem(itemString)) return Promise.reject("Not a Poe Item");

  const itemSections = itemString.split(ITEM_SECTION_MARKER);

  const affixInfo = await fetcher.fetchAffixInfo();
  const parseData = { affixs: [], implicit: [] } as unknown as ParsedItemData;

  const itemClass = getItemClass(itemString);
  if (!itemClass) throw new Error("Unable to determine item class");

  const itemRarity = getItemRarity(itemString);
  if (!itemRarity) throw new Error("Unable to determine item rarity!");

  const quality = getQuality(itemString);
  if (quality) parseData.quality = quality;

  const areaLevel = getAreaLevel(itemString);
  if (areaLevel) parseData.areaLevel = areaLevel;

  const itemLevel = getItemLevel(itemString);
  if (itemLevel) parseData.itemLevel = itemLevel;

  parseData.stats = getItemStats(itemString);

  if (itemRarity === "Currency") {
    const lines = itemSections[0].split("\n").filter((s) => s.length > 0);
    return {
      name: lines[lines.length - 1],
      itemClass: itemClass,
      rarity: itemRarity,
      areaLevel: areaLevel,
    };
  }

  const explicitSectionIdx = getExplicitSectionIdx(
    itemRarity,
    itemClass,
    itemSections,
  );

  for (const line of itemString.split("\n")) {
    if (!line.includes("(implicit)")) continue;
    const x = line.replace(" (implicit)", "").trim();
    if (x.trim() === "") continue;
    const rolls = x.match(/\d+(?:\.\d+)?/g);

    const roll = rolls
      ? rolls.map(Number).reduce((sum, num) => sum + num, 0) / rolls.length
      : undefined;

    const matchedAffix = [] as AffixInfo[];
    for (const affix of affixInfo.filter((ai) => ai.type === "implicit")) {
      if (affix.mappedRegex.exec(x.replace("\r", "")) != null) {
        console.log(
          `${x} matched using ${affix.mappedRegex}, poe_id: ${affix.id}`,
        );
        matchedAffix.push({
          type: "IMPLICIT",
          regex: affix.mappedRegex,
          poe_id: affix.id,
          rawText: x,
        });
      }
    }
    if (matchedAffix.length === 0) {
      throw new Error(`COULD NOT MATCH ${x}`);
    }
    parseData.implicit?.push({
      roll: roll,
      affix: matchedAffix,
      included: false,
    });
  }

  for (let i = 0; i < itemSections.length; i++) {
    const section = itemSections[i];

    if (i === explicitSectionIdx) {
      const explicitMatches = findAffixMatches(section, affixInfo);
      for (const match of explicitMatches) {
        const rolls = match.text.match(/\d+(?:\.\d+)?/g);
        const roll = rolls
          ? rolls.map(Number).reduce((sum, num) => sum + num, 0) / rolls.length
          : undefined;

        parseData.affixs?.push({
          roll,
          affix: [
            {
              type: "EXPLICIT",
              regex: match.affix.mappedRegex,
              poe_id: match.affix.id,
              rawText: match.text,
            },
          ],
          included: false,
        });
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
