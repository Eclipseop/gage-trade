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
          regex:
            /^(?:an|\+?\d+(?:\.\d+)?) Maps in Range contain Breache(s?)( in your Maps)?$/g,
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
            /^(?:an|\+?\d+(?:\.\d+)?) Maps in Range contain Expedition Encounter(s?)( in your Maps)?$/g,
          type: "IMPLICIT",
          rawText: "7 Maps in Range contain Expedition Encounters",
        },
      ],
    };

    expect(parsedItem.implicit).toContainEqual(i1);
    expect(parsedItem.affixs?.length).toEqual(2);
  });

  test("inc rares + rares have additional modifier", async () => {
    const itemString = `Item Class: Tablet
Rarity: Magic
Brimming Precursor Tablet of the Nemesis
--------
Item Level: 79
--------
10 Maps in Range are Irradiated (implicit)
--------
13% increased Rare Monsters in your Maps
Rare Monsters in your Maps have a 27% chance to have an additional Modifier
--------
Can be used in a completed Tower on your Atlas to influence surrounding Maps. Tablets are consumed once placed into a Tower.
`;
    const parsedItem = await parse(itemString);

    const i1: ParsedAffix = {
      roll: 10,
      affix: [
        {
          poe_id: "implicit.stat_4041853756",
          regex:
            /^(?:an|\+?\d+(?:\.\d+)?) Maps in Range are Irradiated(s?)( in your Maps)?$/g,
          type: "IMPLICIT",
          rawText: "10 Maps in Range are Irradiated",
        },
      ],
    };

    expect(parsedItem.implicit).toContainEqual(i1);
    expect(parsedItem.affixs?.length).toEqual(2);
  });

  test("inc rares + rares have additional modifier 2", async () => {
    const itemString = `Item Class: Tablet
Rarity: Magic
Brimming Precursor Tablet of the Nemesis
--------
Item Level: 79
--------
10 Maps in Range are Irradiated (implicit)
--------
13% increased Rare Monsters in your Maps
Rare Monsters in your Maps have a 27% chance to have an additional Modifier
--------
Can be used in a completed Tower on your Atlas to influence surrounding Maps. Tablets are consumed once placed into a Tower.
`;
    const parsedItem = await parse(itemString);

    const i1: ParsedAffix = {
      roll: 10,
      affix: [
        {
          poe_id: "implicit.stat_4041853756",
          regex:
            /^(?:an|\+?\d+(?:\.\d+)?) Maps in Range are Irradiated(s?)( in your Maps)?$/g,
          type: "IMPLICIT",
          rawText: "10 Maps in Range are Irradiated",
        },
      ],
    };

    expect(parsedItem.implicit).toContainEqual(i1);
    expect(parsedItem.affixs?.length).toEqual(2);
  });

  test("inc rares + rares have additional modifier 3", async () => {
    const itemString = `Item Class: Tablet
Rarity: Magic
Brimming Precursor Tablet of the Nemesis
--------
Item Level: 79
--------
10 Maps in Range are Irradiated (implicit)
--------
13% increased Rare Monsters in your Maps
Rare Monsters in your Maps have a 27% chance to have an additional Modifier
--------
Can be used in a completed Tower on your Atlas to influence surrounding Maps. Tablets are consumed once placed into a Tower.
`;
    const parsedItem = await parse(itemString);

    const i1: ParsedAffix = {
      roll: 10,
      affix: [
        {
          poe_id: "implicit.stat_4041853756",
          regex:
            /^(?:an|\+?\d+(?:\.\d+)?) Maps in Range are Irradiated(s?)( in your Maps)?$/g,
          type: "IMPLICIT",
          rawText: "10 Maps in Range are Irradiated",
        },
      ],
    };

    expect(parsedItem.implicit).toContainEqual(i1);
    expect(parsedItem.affixs?.length).toEqual(2);
  });

  test("inc quant + ess", async () => {
    const itemString = `Item Class: Tablet
Rarity: Magic
Plundering Precursor Tablet of the Essence
--------
Item Level: 80
--------
10 Maps in Range are Irradiated (implicit)
--------
11% increased Quantity of Items found in your Maps
Your Maps have +16% chance to contain an Essence
--------
Can be used in a completed Tower on your Atlas to influence surrounding Maps. Tablets are consumed once placed into a Tower.
`;
    const parsedItem = await parse(itemString);

    const i1: ParsedAffix = {
      roll: 10,
      affix: [
        {
          poe_id: "implicit.stat_4041853756",
          regex:
            /^(?:an|\+?\d+(?:\.\d+)?) Maps in Range are Irradiated(s?)( in your Maps)?$/g,
          type: "IMPLICIT",
          rawText: "10 Maps in Range are Irradiated",
        },
      ],
    };

    expect(parsedItem.implicit).toContainEqual(i1);
    expect(parsedItem.affixs?.length).toEqual(2);
  });
});
