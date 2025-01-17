import { parse } from "@/parser/item-parser";
import type { ItemStat, ParsedItemData } from "@/types/parser";
import { expect, test } from "vitest";

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
  expect(parsedItem.implicit?.length).toBe(1);
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
        regex: /^\+?\d+(?:\.\d+)?% to Fire Resistance(s?)$/g,
        type: "EXPLICIT",
      },
    ],
    roll: 31,
  };
  const a2 = {
    affix: [
      {
        poe_id: "explicit.stat_1671376347",
        rawText: "+38% to Lightning Resistance",
        regex: /^\+?\d+(?:\.\d+)?% to Lightning Resistance(s?)$/g,
        type: "EXPLICIT",
      },
    ],
    roll: 38,
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

test("combined edps item", async () => {
  const itemString = `Item Class: Crossbows
Rarity: Rare
Beast Core
Advanced Dyad Crossbow
--------
[Physical] Damage: 30-87 (augmented)
[ElementalDamage|Elemental] Damage: 13-18 (augmented), 3-54 (augmented)
[Critical|Critical Hit] Chance: 5.00%
Attacks per Second: 1.60
Reload Time: 1.10
--------
Requirements:
Level: 55
[Strength|Str]: 69 (unmet)
[Dexterity|Dex]: 69 (unmet)
--------
Sockets: S S 
--------
Item Level: 80
--------
Loads an additional bolt (implicit)
--------
Adds 13 to 21 [Physical|Physical] Damage
Adds 13 to 18 [Cold|Cold] Damage
Adds 3 to 54 [Lightning|Lightning] Damage
Gain 46 Life per Enemy Killed
[ManaLeech|Leeches] 6.17% of [Physical|Physical] Damage as Mana`;

  const parsedSampleItem = await parse(itemString);

  expect(parsedSampleItem.itemClass).toBe("Crossbows");
  expect(parsedSampleItem.rarity).toBe("Rare");
  expect(parsedSampleItem.name).toBe("Beast Core");

  expect(
    parsedSampleItem.stats?.find((f) => f.type === "physical-damage")?.value,
  ).toBe(58.5);
  expect(
    parsedSampleItem.stats?.find((f) => f.type === "elemental-damage")?.value,
  ).toBe(44);
  expect(
    parsedSampleItem.stats?.find((f) => f.type === "physical-damage-dps")
      ?.value,
  ).toBe(93.6);
  expect(
    parsedSampleItem.stats?.find((f) => f.type === "elemental-damage-dps")
      ?.value,
  ).toBe(70.4);
  expect(
    parsedSampleItem.stats?.find((f) => f.type === "total-edps")?.value,
  ).toBe(70.4);
  expect(
    parsedSampleItem.stats?.find((f) => f.type === "total-dps")?.value,
  ).toBe(164);
});

test("seperated edps item", async () => {
  const itemString = `Item Class: Two Hand Maces
Rarity: Rare
Spirit Blast
Advanced Oak Greathammer
--------
Physical Damage: 106-196 (augmented)
Cold Damage: 23-27 (augmented)
Critical Hit Chance: 5.00%
Attacks per Second: 1.05
--------
Requirements:
Level: 48
Str: 104 (unmet)
--------
Item Level: 80
--------
Causes 32% increased Stun Buildup (implicit)
--------
80% increased Physical Damage
Adds 23 to 27 Cold Damage
102% increased Elemental Damage with Attacks
Causes 51% increased Stun Buildup`;

  const parsedSampleItem = await parse(itemString);

  expect(parsedSampleItem.itemClass).toBe("Two Hand Maces");
  expect(parsedSampleItem.rarity).toBe("Rare");
  expect(parsedSampleItem.name).toBe("Spirit Blast");

  expect(
    parsedSampleItem.stats?.find((f) => f.type === "physical-damage")?.value,
  ).toBe(151);
  expect(
    parsedSampleItem.stats?.find((f) => f.type === "elemental-damage")?.value,
  ).toBe(undefined);
  expect(
    parsedSampleItem.stats?.find((f) => f.type === "cold-damage")?.value,
  ).toBe(25);
  expect(
    parsedSampleItem.stats?.find((f) => f.type === "physical-damage-dps")
      ?.value,
  ).toBe(158.6);
  expect(
    parsedSampleItem.stats?.find((f) => f.type === "total-edps")?.value,
  ).toBe(26.3);
  expect(
    parsedSampleItem.stats?.find((f) => f.type === "total-dps")?.value,
  ).toBe(184.9);
});
