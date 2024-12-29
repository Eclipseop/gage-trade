import type {
  ItemStat,
  ParsedItemData,
  RollableSearchableAffix,
} from "@/types/parser";
import AffixInfoFetcher, { type AffixEntry } from "./affix-info";

interface ItemVisitor {
  visitLine?(line: string, sectionIdx: number): void;
  visitSectionStart?(section: string, idx: number): void;
  getResult(): Partial<ParsedItemData>;
}

type MatchedAffix = {
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

class BasicInfoVisitor implements ItemVisitor {
  private data: Partial<ParsedItemData> = {};

  visitLine(line: string, _sectionIdx: number): void {
    if (line.includes("Rarity: ")) {
      const matches = line.match(/(Normal|Magic|Rare|Unique|Currency)/);
      if (matches) this.data.rarity = matches[0];
    } else if (line.includes("Item Class: ")) {
      const matches = line.match(/(?<=Item Class: )[A-z ]+/);
      if (matches) this.data.itemClass = matches[0];
    } else if (line.startsWith("Quality: +")) {
      const matches = line.match(/\d+/);
      if (matches) this.data.quality = Number(matches[0]);
    } else if (line.startsWith("Area Level: ")) {
      const matches = line.match(/\d+/);
      if (matches) this.data.areaLevel = Number(matches[0]);
    } else if (line.startsWith("Item Level: ")) {
      const matches = line.match(/\d+/);
      if (matches) this.data.itemLevel = Number(matches[0]);
    }
  }

  visitSectionStart(section: string, idx: number): void {
    if (idx !== 0) return;
    const sectionParts = section.split("\n").filter((i) => i.length > 0);

    for (let x = 0; x < sectionParts.length; x++) {
      const s = sectionParts[x].replace("\r", "");
      switch (x) {
        case 0:
          this.data.itemClass = s.replace("Item Class: ", "");
          break;
        case 1:
          this.data.rarity = s.replace("Rarity: ", "");
          break;
        case 2:
          this.data.name = s;
          break;
        case 3:
          this.data.base = s;
          break;
      }
    }
  }

  getResult(): Partial<ParsedItemData> {
    return this.data;
  }
}

class StatsVisitor implements ItemVisitor {
  private stats: ItemStat[] = [];

  private statPatterns = [
    { type: "armour", patterns: ["Armour"] },
    { type: "evasion", patterns: ["Evasion", "Evasion Rating"] },
    { type: "energy-shield", patterns: ["Energy Shield", "EnergyShield"] },
    { type: "spirit", patterns: ["Spirit"] },
    {
      type: "physical-damage",
      patterns: ["Physical Damage", "PhysicalDamage"],
    },
    { type: "cold-damage", patterns: ["Cold Damage", "ColdDamage"] },
    { type: "fire-damage", patterns: ["Fire Damage", "FireDamage"] },
    {
      type: "lightning-damage",
      patterns: ["Lightning Damage", "LightningDamage"],
    },
    { type: "crit-chance", patterns: ["Critical Hit Chance"] },
    { type: "attacks-per-second", patterns: ["Attacks per Second"] },
    { type: "reload-time", patterns: ["Reload Time"] },
  ];

  visitLine(line: string, _sectionIndex: number) {
    for (const { type, patterns } of this.statPatterns) {
      if (patterns.some((pattern) => line.startsWith(pattern))) {
        const rolls = line.match(/\d+(?:\.\d+)?/g);
        if (rolls) {
          const value =
            rolls.map(Number).reduce((sum, num) => sum + num, 0) / rolls.length;
          this.stats.push({ type, value });
        }
      }
    }
  }

  visitSectionStart(_section: string, _index: number) {}

  getResult(): Partial<ParsedItemData> {
    return { stats: this.stats };
  }
}

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
