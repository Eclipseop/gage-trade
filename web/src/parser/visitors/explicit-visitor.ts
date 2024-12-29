import type { AffixEntry } from "@/trade/affix-info";
import type { ParsedItemData, RollableSearchableAffix } from "@/types/parser";
import type { ItemVisitor, MatchedAffix } from "../item-parser";

class ExplicitVisitor implements ItemVisitor {
  private explicitMods: RollableSearchableAffix[] = [];
  private explicitSectionIndex = -1;

  constructor(
    private affixInfo: AffixEntry[],
    private allSections: string[],
  ) {
    this.explicitSectionIndex = this.calculateExplicitSectionIndex();
  }

  visitSectionStart(section: string, idx: number): void {
    if (idx !== this.explicitSectionIndex) return;

    const matches = this.findAffixMatches(section);
    for (const match of matches) {
      const rolls = match.text.match(/\d+(?:\.\d+)?/g);
      const roll = rolls
        ? rolls.map(Number).reduce((sum, num) => sum + num, 0) / rolls.length
        : undefined;

      this.explicitMods.push({
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

  private calculateExplicitSectionIndex(): number {
    let idx = -1;

    const itemString = this.allSections.join();

    if (itemString.includes("Item Class: Tablet")) {
      return -1;
    }
    for (let i = 0; i < this.allSections.length; i++) {
      const section = this.allSections[i];

      const appendage =
        section.includes("Corrupted") ||
        section.includes("Note: ") ||
        section.includes("allocated Jewel Socket");

      if (!appendage) idx = i;
    }
    if (itemString.includes("Rarity: Unique")) {
      idx = idx - 1;
    }
    if (itemString.includes("Item Class: Quivers")) {
      idx = idx - 1;
    }
    return idx;
  }

  private findAffixMatches(text: string): Array<MatchedAffix> {
    const matches: MatchedAffix[] = [];
    let remainingText = text.trim();

    if (!remainingText) return matches;

    let attempts = 0;
    while (remainingText.length > 0 && attempts < 20) {
      attempts++;
      for (const affix of this.affixInfo) {
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
  }

  getResult(): Partial<ParsedItemData> {
    return { affixs: this.explicitMods };
  }
}

export default ExplicitVisitor;
