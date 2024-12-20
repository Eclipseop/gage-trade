import { expect, test } from "vitest";
import { parse } from "../src/item-parser";

const sample_item = `Item Class: Body Armours
Rarity: Rare
Tempest Cloak
Advanced Vaal Cuirass
--------
Quality: +3% (augmented)
Armour: 497 (augmented)
--------
Requirements:
Level: 62
Str: 128
--------
Sockets: S S 
--------
Item Level: 74
--------
+24% to Fire Resistance (rune)
--------
36% increased Armour
+212 to maximum Life
+38 to Spirit
+22% to Cold Resistance
+18% to Lightning Resistance
+45 to Stun Threshold`;

const sample_item2 = `Item Class: Two Hand Maces
Rarity: Magic
Reliable Expert Forge Maul of Nourishment
--------
Physical Damage: 112-151
Critical Hit Chance: 5.00%
Attacks per Second: 1.05
--------
Requirements:
Level: 67
Str: 174
--------
Item Level: 67
--------
+38 to Accuracy Rating
Grants 5 Life per Enemy Hit`;

const sample_item3 = `Item Class: Jewels
Rarity: Rare
Entropy Bliss
Emerald
--------
Item Level: 67
--------
15% increased Elemental Damage
11% increased amount of Mana Leeched
9% increased Duration of Ignite, Shock and Chill on Enemies
15% increased Magnitude of Shock you inflict
--------
Place into an allocated Jewel Socket on the Passive Skill Tree. Right click to remove from the Socket.
--------
Note: ~price 10 exalted
`;

const sample_item4 = `Item Class: Helmets
Rarity: Rare
Sol Ward
Advanced Spired Greathelm
--------
Quality: +18% (augmented)
Armour: 312 (augmented)
--------
Requirements:
Level: 55
Str: 101
--------
Sockets: S 
--------
Item Level: 59
--------
+12% to Lightning Resistance (rune)
--------
26% increased Armour
+110 to maximum Life
+73 to maximum Mana
15% increased Rarity of Items found
+1 to Level of all Minion Skills
+30% to Cold Resistance`;

const sample_item5 = `Item Class: Socketable
Rarity: Currency
Soul Core of Topotante
--------
Stack Size: 1/10
--------
Martial Weapon: Attacks with this Weapon Penetrate 15% Elemental Resistances
Armour: 15% increased Elemental Ailment Threshold
--------
Place into an empty Rune Socket in a Martial Weapon or Armour to apply its effect to that item. Once socketed it cannot be removed or replaced.
`;

test("sample item 1", async () => {
  const parsedSampleItem = await parse(sample_item);
  expect(parsedSampleItem.itemClass).toBe("Body Armours");
  expect(parsedSampleItem.rarity).toBe("Rare");
  expect(parsedSampleItem.name).toBe("Tempest Cloak");

  const a1 = {
    affix: [
      {
        poe_id: "explicit.stat_3299347043",
        rawText: "+212 to maximum Life",
        regex: /\d+(?:\.\d+)? to maximum Life$/g,
        type: "EXPLICIT",
      },
    ],
    roll: 212,
  };

  const { affixs } = parsedSampleItem;
  expect(affixs.length).toBe(6);
  expect(affixs).toContainEqual(a1);
});

test("sample item 2", async () => {
  const parsedSampleItem = await parse(sample_item2);
  expect(parsedSampleItem.itemClass).toBe("Two Hand Maces");
  expect(parsedSampleItem.rarity).toBe("Magic");
  expect(parsedSampleItem.name).toBe(
    "Reliable Expert Forge Maul of Nourishment",
  );

  const a1 = {
    roll: 38,
    affix: [
      {
        type: "EXPLICIT",
        regex: /\d+(?:\.\d+)? to (Accuracy|Accuracy) Rating$/g,
        poe_id: "explicit.stat_691932474",
        rawText: "+38 to Accuracy Rating",
      },
      {
        type: "EXPLICIT",
        regex: /\d+(?:\.\d+)? to (Accuracy|Accuracy) Rating$/g,
        poe_id: "explicit.stat_803737631",
        rawText: "+38 to Accuracy Rating",
      },
    ],
  };

  const { affixs } = parsedSampleItem;
  expect(affixs.length).toBe(2);
  expect(affixs).toContainEqual(a1);
});

test("sample item 3", async () => {
  const parsedSampleItem = await parse(sample_item3);
  expect(parsedSampleItem.itemClass).toBe("Jewels");
  expect(parsedSampleItem.rarity).toBe("Rare");
  expect(parsedSampleItem.name).toBe("Entropy Bliss");

  const a1 = {
    roll: 15,
    affix: [
      {
        type: "EXPLICIT",
        regex:
          /\d+(?:\.\d+)?% (increased|reduced) (ElementalDamage|Elemental Damage)$/g,
        poe_id: "explicit.stat_3141070085",
        rawText: "15% increased Elemental Damage",
      },
    ],
  };

  const { affixs } = parsedSampleItem;
  expect(affixs.length).toBe(4);
  expect(affixs).toContainEqual(a1);
});

test("sample item 4", async () => {
  const parsedSampleItem = await parse(sample_item4);
  expect(parsedSampleItem.itemClass).toBe("Helmets");
  expect(parsedSampleItem.rarity).toBe("Rare");
  expect(parsedSampleItem.name).toBe("Sol Ward");

  const a1 = {
    roll: 15,
    affix: [
      {
        poe_id: "explicit.stat_3917489142",
        rawText: "15% increased Rarity of Items found",
        regex:
          /\d+(?:\.\d+)?% (increased|reduced) (ItemRarity|Rarity of Items) found$/g,
        type: "EXPLICIT",
      },
    ],
  };

  const { affixs } = parsedSampleItem;
  expect(affixs.length).toBe(6);
  expect(affixs).toContainEqual(a1);
});

test("sample item 5", async () => {
  const parsedSampleItem = await parse(sample_item5);
  expect(parsedSampleItem.itemClass).toBe("Socketable");
  expect(parsedSampleItem.rarity).toBe("Currency");
  expect(parsedSampleItem.name).toBe("Soul Core of Topotante");
});
