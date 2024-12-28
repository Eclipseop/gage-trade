import { expect, test } from "vitest";
import { parse } from "../src/trade/item-parser";
import type { ItemStat, ParsedItemData } from "../src/types/parser";

test("precursor", async () => {
  const input = `Item Class: Tablet
Rarity: Normal
Delirium Precursor Tablet
--------
Item Level: 75
--------
10 Maps in Range contain [ContainsDelirium|Mirrors of Delirium] (implicit)
--------
Can be used in a completed Tower on your Atlas to influence surrounding Maps. Tablets are consumed once placed into a Tower.`;
  const parsedItem = await parse(input);

  expect(parsedItem.name).toBe("Delirium Precursor Tablet");
  expect(parsedItem.implicit.length).toBe(1);
});

test("unique gloves", async () => {
  const input = `Item Class: Gloves
Rarity: Unique
Kitoko's Current
Jewelled Gloves
--------
[Quality]: +8% (augmented)
[EnergyShield|Energy Shield]: 33 (augmented)
--------
Requirements:
Level: 26
[Intelligence|Int]: 43
--------
Sockets: S 
--------
Item Level: 74
--------
Damage [Penetration|Penetrates] 15% [Resistances|Cold Resistance] (enchant)
--------
+12% to [Resistances|Cold Resistance] (rune)
--------
37% increased [EnergyShield|Energy Shield]
+14 to [Dexterity|Dexterity]
11% reduced [Attack] and Cast Speed
[Lightning] damage from [HitDamage|Hits] [Contributes] to [Electrocute|Electrocution] Buildup
--------
Reality is a puzzle. Ingenuity is power.
--------
[Corrupted]`;
  const parsedItem: ParsedItemData = await parse(input);

  const es: ItemStat = {
    type: "energy-shield",
    value: 33,
  };

  expect(parsedItem.name).toBe("Kitoko's Current");
  expect(parsedItem.quality).toBe(8);
  expect(parsedItem.stats).toContainEqual(es);

  expect(parsedItem.implicit?.length).toBe(0);
  expect(parsedItem.affixs?.length).toBe(4);
});

test("es chest matching fire/lightning", async () => {
  const input = `Item Class: Body Armours
Rarity: Rare
Vengeance Carapace
Expert Hexer's Robe
--------
[Quality]: +9% (augmented)
[EnergyShield|Energy Shield]: 500 (augmented)
--------
Requirements:
Level: 65
[Intelligence|Int]: 157
--------
Sockets: S S 
--------
Item Level: 81
--------
+14% to [Resistances|Chaos Resistance] (rune)
--------
+81 to maximum [EnergyShield|Energy Shield]
73% increased [EnergyShield|Energy Shield]
+195 to maximum Life
+27 to [Intelligence|Intelligence]
+31% to [Resistances|Fire Resistance]
+38% to [Resistances|Lightning Resistance]`;
  const parsedItem: ParsedItemData = await parse(input);

  const es: ItemStat = {
    type: "energy-shield",
    value: 500,
  };

  expect(parsedItem.name).toBe("Vengeance Carapace");
  expect(parsedItem.quality).toBe(9);
  expect(parsedItem.itemLevel).toBe(81);
  expect(parsedItem.stats).toContainEqual(es);
  expect(parsedItem.implicit?.length).toBe(0);
  expect(parsedItem.affixs?.length).toBe(6);

  const a1 = {
    affix: [
      {
        poe_id: "explicit.stat_3372524247",
        rawText: "+31% to Fire Resistance",
        regex: /^\+?\d+(?:\.\d+)?% to (Resistances|Fire Resistance)$/g,
        type: "EXPLICIT",
      },
    ],
    roll: 31,
    included: false,
  };
  const a2 = {
    affix: [
      {
        poe_id: "explicit.stat_1671376347",
        rawText: "+38% to Lightning Resistance",
        regex: /^\+?\d+(?:\.\d+)?% to (Resistances|Lightning Resistance)$/g,
        type: "EXPLICIT",
      },
    ],
    roll: 38,
    included: false,
  };

  expect(parsedItem.affixs).toContainEqual(a1);
  expect(parsedItem.affixs).toContainEqual(a2);
});

test("ar/ev chest", async () => {
  const input = `Item Class: Body Armours
Rarity: Rare
Vengeance Shell
Advanced Cloaked Mail
--------
[Armour]: 328 (augmented)
[Evasion|Evasion Rating]: 289 (augmented)
--------
Requirements:
Level: 55
[Strength|Str]: 62 (unmet)
[Dexterity|Dex]: 62 (unmet)
--------
Item Level: 76
--------
+25 to [Armour|Armour]
+18 to [Evasion] Rating
63% increased [Armour|Armour] and [Evasion|Evasion]
+52 to [Spirit|Spirit]
+12 to [Strength|Strength]
+27% to [Resistances|Cold Resistance]
`;
  const parsedItem: ParsedItemData = await parse(input);

  const armour: ItemStat = {
    type: "armour",
    value: 328,
  };
  const evasion: ItemStat = {
    type: "evasion",
    value: 289,
  };

  expect(parsedItem.name).toBe("Vengeance Shell");
  expect(parsedItem.quality).toBe(undefined);
  expect(parsedItem.itemLevel).toBe(76);
  expect(parsedItem.stats).toContainEqual(armour);
  expect(parsedItem.stats).toContainEqual(evasion);
  expect(parsedItem.implicit?.length).toBe(0);
  expect(parsedItem.affixs?.length).toBe(6);
});