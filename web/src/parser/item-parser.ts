import type { ParsedItemData } from "@/types/parser";
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

  return parser.process(sanitizedItemString);
};
