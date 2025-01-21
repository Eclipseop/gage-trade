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
            /^(?:an|\+?\d+(?:\.\d+)?) Maps in Range contain Breache(s?)( in your Maps)?$/,
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
            /^(?:an|\+?\d+(?:\.\d+)?) Maps in Range contain Expedition Encounter(s?)( in your Maps)?$/,
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
            /^(?:an|\+?\d+(?:\.\d+)?) Maps in Range are Irradiated(s?)( in your Maps)?$/,
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
            /^(?:an|\+?\d+(?:\.\d+)?) Maps in Range are Irradiated(s?)( in your Maps)?$/,
          type: "IMPLICIT",
          rawText: "10 Maps in Range are Irradiated",
        },
      ],
    };

    expect(parsedItem.implicit).toContainEqual(i1);
    expect(parsedItem.affixs?.length).toEqual(2);
  });

  test("exp gain + strongbox", async () => {
    const itemString = `Item Class: Tablet
Rarity: Magic
Elevated Precursor Tablet of Strongboxes
--------
Item Level: 79
--------
6 Maps in Range are Irradiated (implicit)
--------
7% increased Experience gain in your Maps
Your Maps have +10% chance to contain a Strongbox
--------
Can be used in a completed Tower on your Atlas to influence surrounding Maps. Tablets are consumed once placed into a Tower.
`;
    const parsedItem = await parse(itemString);

    const i1: ParsedAffix = {
      roll: 6,
      affix: [
        {
          poe_id: "implicit.stat_4041853756",
          regex:
            /^(?:an|\+?\d+(?:\.\d+)?) Maps in Range are Irradiated(s?)( in your Maps)?$/,
          type: "IMPLICIT",
          rawText: "6 Maps in Range are Irradiated",
        },
      ],
    };

    expect(parsedItem.implicit).toContainEqual(i1);
    expect(parsedItem.affixs?.length).toEqual(2);
  });

  test("deli % reward + packsize", async () => {
    const itemString = `Item Class: Tablet
Rarity: Magic
Breeding Delirium Precursor Tablet of the Pursuit
--------
Item Level: 69
--------
6 Maps in Range contain Mirrors of Delirium (implicit)
--------
Delirious Monsters Killed in your Maps provide 10% increased Reward Progress
8% increased Pack Size in your Maps
--------
Can be used in a completed Tower on your Atlas to influence surrounding Maps. Tablets are consumed once placed into a Tower.
`;
    const parsedItem = await parse(itemString);

    const i1: ParsedAffix = {
      roll: 6,
      affix: [
        {
          poe_id: "implicit.stat_3879011313",
          regex:
            /^(?:an|\+?\d+(?:\.\d+)?) Maps in Range contain Mirrors of Delirium(s?)( in your Maps)?$/,
          type: "IMPLICIT",
          rawText: "6 Maps in Range contain Mirrors of Delirium",
        },
      ],
    };

    expect(parsedItem.implicit).toContainEqual(i1);
    expect(parsedItem.affixs?.length).toEqual(2);
  });

  test("exp quant artifacts + inc magic mobs", async () => {
    const itemString = `Item Class: Tablet
Rarity: Magic
Teeming Expedition Precursor Tablet of Verisium
--------
Item Level: 79
--------
5 Maps in Range contain Expedition Encounters (implicit)
--------
7% increased quantity of Artifacts dropped by Monsters in your Maps
22% increased Magic Monsters in your Maps
--------
Can be used in a completed Tower on your Atlas to influence surrounding Maps. Tablets are consumed once placed into a Tower.

`;
    const parsedItem = await parse(itemString);

    const i1: ParsedAffix = {
      roll: 5,
      affix: [
        {
          poe_id: "implicit.stat_1714888636",
          regex:
            /^(?:an|\+?\d+(?:\.\d+)?) Maps in Range contain Expedition Encounter(s?)( in your Maps)?$/,
          type: "IMPLICIT",
          rawText: "5 Maps in Range contain Expedition Encounters",
        },
      ],
    };

    expect(parsedItem.implicit).toContainEqual(i1);
    expect(parsedItem.affixs?.length).toEqual(2);
  });
});
