import type { ItemStat, ParsedItemData } from "@/types/parser";
import type { ItemVisitor } from "../item-parser";

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
    {
      type: "elemental-damage",
      patterns: ["Elemental Damage", "ElementalDamage"],
    },
    { type: "crit-chance", patterns: ["Critical Hit Chance"] },
    { type: "attacks-per-second", patterns: ["Attacks per Second"] },
    { type: "reload-time", patterns: ["Reload Time"] },
  ];

  visitLine(line: string, _sectionIndex: number) {
    for (const { type, patterns } of this.statPatterns) {
      if (patterns.some((pattern) => line.startsWith(pattern))) {
        if (type === "elemental-damage") {
          const parts = line.split(",");

          const allRolls: number[] = [];
          for (const part of parts) {
            const rolls = part.match(/\d+(?:\.\d+)?/g);
            if (rolls) {
              const value =
                rolls?.map(Number).reduce((sum, num) => sum + num, 0) /
                rolls.length;
              allRolls.push(value);
            }
          }
          const totalEleDamage = allRolls.reduce((sum, num) => sum + num, 0);
          this.stats.push({ type, value: totalEleDamage });
        } else {
          const rolls = line.match(/\d+(?:\.\d+)?/g);
          if (rolls) {
            const value =
              rolls.map(Number).reduce((sum, num) => sum + num, 0) /
              rolls.length;
            this.stats.push({ type, value });
          }
        }
      }
    }
  }

  getResult(): Partial<ParsedItemData> {
    return { stats: this.stats };
  }
}

export default StatsVisitor;
