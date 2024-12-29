import type { AffixEntry } from "@/trade/affix-info";
import type { ParsedItemData, RollableSearchableAffix } from "@/types/parser";
import type { ItemVisitor } from "../item-parser";

class ImplicitVisitor implements ItemVisitor {
  constructor(private affixInfo: AffixEntry[]) {}
  private implicits: RollableSearchableAffix[] = [];

  visitLine(line: string, _sectionIndex: number) {
    if (!line.includes("(implicit)")) return;

    const implicitText = line.replace(" (implicit)", "").trim();
    if (!implicitText) return;

    const rolls = implicitText.match(/\d+(?:\.\d+)?/g);
    const roll = rolls
      ? rolls.map(Number).reduce((sum, num) => sum + num, 0) / rolls.length
      : undefined;

    const matchedAffixes = this.affixInfo
      .filter((ai) => ai.type === "implicit")
      .filter((affix) => affix.mappedRegex.exec(implicitText.replace("\r", "")))
      .map((affix) => ({
        type: "IMPLICIT" as const,
        regex: affix.mappedRegex,
        poe_id: affix.id,
        rawText: implicitText,
      }));

    if (matchedAffixes.length === 0) {
      throw new Error(`Could not match implicit: ${line}`);
    }

    this.implicits.push({
      roll,
      affix: matchedAffixes,
      included: false,
    });
  }

  getResult(): Partial<ParsedItemData> {
    return { implicit: this.implicits };
  }
}

export default ImplicitVisitor;
