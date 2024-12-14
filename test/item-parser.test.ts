import { expect, test } from "vitest";
import { parse } from "../src/item-parser";

const sample_item = `Item Class: Crossbows
Rarity: Rare
Morbid Core
Advanced Bombard Crossbow
--------
[Quality]: +20% (augmented)
[Physical] Damage: 95-267 (augmented)
Fire Damage: 16-22 (augmented)
[Critical|Critical Hit] Chance: 5.00%
Attacks per Second: 1.65
Reload Time: 0.75
--------
Requirements:
Level: 59
[Strength|Str]: 74
[Dexterity|Dex]: 74 (unmet)
--------
Sockets: S S 
--------
Item Level: 60
--------
40% increased [Physical] Damage (rune)
--------
[Grenade] Skills Fire an additional [Projectile|Projectile] (implicit)
--------
62% increased [Physical] Damage
Adds 20 to 33 [Physical|Physical] Damage
Adds 16 to 22 [Fire|Fire] Damage
+11 to [Dexterity|Dexterity]
[LifeLeech|Leeches] 5.41% of [Physical|Physical] Damage as Life
Gain 8 Life per Enemy Killed`;

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
Grants 5 Life per Enemy Hit
`;

test("sample item 1", () => {
  const parsedSampleItem = parse(sample_item);
  expect(parsedSampleItem.itemClass).toBe("Crossbows");
  expect(parsedSampleItem.rarity).toBe("Rare");
  expect(parsedSampleItem.name).toBe("Morbid Core");

  console.log(parsedSampleItem.affixs);
  // expect(parse(sample_item).base).toBe("Advanced Bombard Crossbow");
});

test("sample item 2", () => {
  expect(parse(sample_item2).itemClass).toBe("Two Hand Maces");
  expect(parse(sample_item2).rarity).toBe("Magic");
  expect(parse(sample_item2).name).toBe(
    "Reliable Expert Forge Maul of Nourishment"
  );
  // expect(parse(sample_item2).base).toBe("Advanced Bombard Crossbow");
});
