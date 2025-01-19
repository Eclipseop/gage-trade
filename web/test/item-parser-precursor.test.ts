import { parse } from "@/parser/item-parser";
import type { ParsedAffix } from "@/types/parser";
import { describe, expect, test } from "vitest";

describe("Precursor", () => {
  test("breach quant spliters + gold", async () => {
    const itemString = `Item Class: Tablet
Rarity: Magic
Bountiful Breach Precursor Tablet of the Domain
--------
Item Level: 79
--------
9 Maps in Range contain Breaches (implicit)
--------
5% increased Quantity of Breach Splinters dropped by Breach Monsters in your Maps
6% increased Gold found in your Maps
--------
Can be used in a completed Tower on your Atlas to influence surrounding Maps. Tablets are consumed once placed into a Tower.
`;
    const parsedItem = await parse(itemString);

    const i1: ParsedAffix = {
      roll: 9,
      affix: [
        {
          poe_id: "implicit.stat_2219129443",
          regex: /^(?:an|\+?\d+(?:\.\d+)?) Maps in Range contain Breache(s?)$/g,
          type: "IMPLICIT",
          rawText: "9 Maps in Range contain Breaches",
        },
      ],
    };

    expect(parsedItem.implicit).toContainEqual(i1);
    expect(parsedItem.affixs?.length).toEqual(2);
  });

  test("expedition explode + inc rare", async () => {
    const itemString = `Item Class: Tablet
Rarity: Magic
Brimming Expedition Precursor Tablet of the Demolition
--------
Item Level: 75
--------
7 Maps in Range contain Expedition Encounters (implicit)
--------
9% increased Explosive Radius in your Maps
10% increased Rare Monsters in your Maps
--------
Can be used in a completed Tower on your Atlas to influence surrounding Maps. Tablets are consumed once placed into a Tower.
`;
    const parsedItem = await parse(itemString);

    const i1: ParsedAffix = {
      roll: 7,
      affix: [
        {
          poe_id: "implicit.stat_1714888636",
          regex:
            /^(?:an|\+?\d+(?:\.\d+)?) Maps in Range contain Expedition Encounter(s?)$/g,
          type: "IMPLICIT",
          rawText: "7 Maps in Range contain Expedition Encounters",
        },
      ],
    };

    expect(parsedItem.implicit).toContainEqual(i1);
    expect(parsedItem.affixs?.length).toEqual(2);
  });
});
