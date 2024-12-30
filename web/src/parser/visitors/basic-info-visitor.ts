import type { ParsedItemData } from "@/types/parser";
import type { ItemVisitor } from "../item-parser";

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
    } else if (line.startsWith("Waystone Tier: ")) {
      const matches = line.match(/\d+/);
      if (matches) this.data.waystoneTier = Number(matches[0]);
    } else if (line.startsWith("Sockets: ")) {
      const substring = line.replace("Sockets: ", "");
      this.data.numRuneSockets = substring.match(/S/g)?.length;
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

export default BasicInfoVisitor;
