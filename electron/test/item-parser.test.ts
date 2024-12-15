import { expect, test } from "vitest";
import { Affix, parse } from "../src/item-parser";

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
    affix: [
      {
        poe_id: "explicit.stat_803737631",
        rawText: "+38 to Accuracy Rating",
        regex: /\d+(?:\.\d+)? to (Accuracy|Accuracy) Rating$/g,
        type: "EXPLICIT",
      },
      {
        poe_id: "explicit.stat_691932474",
        rawText: "+38 to Accuracy Rating",
        regex: /\d+(?:\.\d+)? to (Accuracy|Accuracy) Rating$/g,
        type: "EXPLICIT",
      },
    ],
    roll: 38,
  };

  const { affixs } = parsedSampleItem;
  expect(affixs.length).toBe(2);
  expect(affixs).toContainEqual(a1);
});