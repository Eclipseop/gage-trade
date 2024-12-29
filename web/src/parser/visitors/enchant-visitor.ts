import type { AffixEntry } from "@/trade/affix-info";
import type { ParsedItemData, RollableSearchableAffix } from "@/types/parser";
import type { ItemVisitor } from "../item-parser";

class EnchantVisitor implements ItemVisitor {
  constructor(private affixInfo: AffixEntry[]) {}
  private enchants: RollableSearchableAffix[] = [];

  visitLine(line: string, _sectionIndex: number) {
    if (!line.includes("(enchant)")) return;

    const enchantText = line.replace(" (enchant)", "").trim();
    if (!enchantText) return;

    const rolls = enchantText.match(/\d+(?:\.\d+)?/g);
    const roll = rolls
      ? rolls.map(Number).reduce((sum, num) => sum + num, 0) / rolls.length
      : undefined;

    const matchedAffixes = this.affixInfo
      .filter((ai) => ai.type === "enchant")
      .filter((affix) => affix.mappedRegex.exec(enchantText.replace("\r", "")))
      .map((affix) => ({
        type: "ENCHANT" as const,
        regex: affix.mappedRegex,
        poe_id: affix.id,
        rawText: enchantText,
      }));

    if (matchedAffixes.length === 0) {
      throw new Error(`Could not match enchant: ${line}`);
    }

    this.enchants.push({
      roll,
      affix: matchedAffixes,
      included: false,
    });
  }

  getResult(): Partial<ParsedItemData> {
    return { enchant: this.enchants };
  }
}

export default EnchantVisitor;
