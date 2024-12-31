import type { ItemStat, ParsedItemData } from "@/types/parser";
import AffixInfoFetcher, { type AffixEntry } from "../trade/affix-info";
import BasicInfoVisitor from "./visitors/basic-info-visitor";
import EnchantVisitor from "./visitors/enchant-visitor";
import ExplicitVisitor from "./visitors/explicit-visitor";
import ImplicitVisitor from "./visitors/implicit-visitor";
import StatsVisitor from "./visitors/stats-visitor";

export interface ItemVisitor {
  visitLine?(line: string, sectionIdx: number): void;
  visitSectionStart?(section: string, idx: number): void;
  getResult(): Partial<ParsedItemData>;
}

export type MatchedAffix = {
  text: string;
  affix: AffixEntry;
};

const SECTION_MARKER = "--------";

class ItemParser {
  private visitors: ItemVisitor[] = [];

  addVisitor(visitor: ItemVisitor) {
    this.visitors.push(visitor);
  }

  process(itemString: string) {
    const sections = itemString.split(SECTION_MARKER);
    sections.forEach((section, idx) => {
      // biome-ignore lint/complexity/noForEach: <explanation>
      this.visitors.forEach((v) => v.visitSectionStart?.(section, idx));

      const lines = section.split("\n");
      // biome-ignore lint/complexity/noForEach: <explanation>
      lines.forEach((line) => {
        if (line.trim()) {
          // biome-ignore lint/complexity/noForEach: <explanation>
          this.visitors.forEach((v) => v.visitLine?.(line, idx));
        }
      });
    });

    return this.visitors.reduce(
      (result, visitor) => ({
        // biome-ignore lint/performance/noAccumulatingSpread: <explanation>
        ...result,
        ...visitor.getResult(),
      }),
      {} as ParsedItemData,
    );
  }
}

export const sanitize = (itemString: string): string => {
  // First handle paired matches with | separator - now taking the last part
  const result = itemString.replace(
    /\[([^|\]]+)\|([^\]]+)\]/g,
    (_, _firstMatch, secondMatch) => secondMatch,
  );

  // Then handle single word brackets - just remove the brackets
  return result.replace(/\[([^\]]+)\]/g, (_, word) => word);
};

export const isPoeItem = (itemData: string): boolean => {
  return itemData.split("--------").length >= 3;
};

const calcDamageStats = (itemData: ParsedItemData): ItemStat[] => {
  const attackSpeed = itemData.stats?.find(
    (p) => p.type === "attacks-per-second",
  );
  if (!attackSpeed) return [];

  const stats: ItemStat[] = [];
  const aps = attackSpeed.value;

  const physicalStats = itemData.stats?.filter(
    (p) => p.type === "physical-damage",
  );
  if (physicalStats) {
    // biome-ignore lint/complexity/noForEach: <explanation>
    physicalStats.forEach((stat) => {
      stats.push({
        type: `${stat.type}-dps`,
        value: stat.value * aps,
        included: false,
      });
    });
  }
  const elementalStats = itemData.stats?.filter(
    (p) => p.type.includes("-damage") && p.type !== "physical-damage",
  );
  if (elementalStats) {
    // biome-ignore lint/complexity/noForEach: <explanation>
    elementalStats.forEach((stat) => {
      stats.push({
        type: `${stat.type}-dps`,
        value: stat.value * aps,
        included: false,
      });
    });
  }

  // Calculate total damage from all damage stats
  const totalDamage = stats.reduce((sum, stat) => {
    if (stat.type.includes("-damage")) {
      return sum + stat.value;
    }
    return sum;
  }, 0);

  // Add total damage stat
  stats.push({
    type: "total-dps",
    value: totalDamage,
    included: false,
  });

  // Calculate total damage from all damage stats
  const etotalDamage = stats
    .filter((p) => p.type.includes("-damage") && p.type !== "physical-damage")
    .reduce((sum, stat) => {
      if (stat.type.includes("-damage")) {
        return sum + stat.value;
      }
      return sum;
    }, 0);

  // Add total damage stat
  stats.push({
    type: "total-edps",
    value: etotalDamage,
    included: false,
  });

  return stats;
};

export const parse = async (itemString: string): Promise<ParsedItemData> => {
  if (!isPoeItem(itemString)) return Promise.reject("Not a Poe Item");

  const sanitizedItemString = sanitize(itemString);

  const affixInfo = await AffixInfoFetcher.getInstance().fetchAffixInfo();
  const parser = new ItemParser();
  const sections = sanitizedItemString.split(SECTION_MARKER);

  parser.addVisitor(new BasicInfoVisitor());
  parser.addVisitor(new StatsVisitor());
  parser.addVisitor(new ImplicitVisitor(affixInfo));
  parser.addVisitor(new EnchantVisitor(affixInfo));
  parser.addVisitor(new ExplicitVisitor(affixInfo, sections));

  const parsedItemData = parser.process(sanitizedItemString);
  const updatedDamageStats = calcDamageStats(parsedItemData);

  console.log("yp", updatedDamageStats);

  // Create a map of the updated damage stats by their type for easy lookup
  const updatedStatsMap = new Map(
    updatedDamageStats.map((stat) => [stat.type, stat]),
  );

  // Start with existing stats that haven't been updated
  const mergedStats = (parsedItemData.stats ?? []).map((stat) =>
    updatedStatsMap.has(stat.type) ? updatedStatsMap.get(stat.type)! : stat,
  );

  // Add any new stats that didn't exist before
  // biome-ignore lint/complexity/noForEach: <explanation>
  updatedDamageStats.forEach((stat) => {
    if (!mergedStats.some((existingStat) => existingStat.type === stat.type)) {
      mergedStats.push(stat);
    }
  });

  parsedItemData.stats = mergedStats;

  return parsedItemData;
};
