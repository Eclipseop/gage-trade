import { expect, test } from "vitest";
import { type ItemStat, parse } from "../src/item-parser";

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

const sample_item6 = `Item Class: Sceptres
Rarity: Rare
Brood Smasher
Shrine Sceptre
--------
Spirit: 100
--------
Requirements:
Level: 66 (unmet)
Str: 46 (unmet)
Int: 117
--------
Item Level: 68
--------
Allies in your Presence deal 7 to 9 additional Attack Fire Damage
Allies in your Presence deal 1 to 10 additional Attack Lightning Damage
+24 to Strength
Minions have 28% increased maximum Life
`;

const sample_item7 = `Item Class: Sceptres
Rarity: Rare
Apocalypse Smasher
Shrine Sceptre
--------
Spirit: 133 (augmented)
--------
Requirements:
Level: 66
Str: 46
Int: 117
--------
Item Level: 68
--------
33% increased Spirit
Allies in your Presence have +67 to Accuracy Rating
Allies in your Presence have 16% increased Attack Speed`;

const sample_item10 = `Item Class: Crossbows
Rarity: Rare
Sorrow Core
Advanced Tense Crossbow
--------
Physical Damage: 17-66
Lightning Damage: 1-23 (augmented)
Critical Hit Chance: 5.00%
Attacks per Second: 1.60
Reload Time: 0.85
--------
Requirements:
Level: 45
Str: 57 (unmet)
Dex: 57 (unmet)
--------
Item Level: 69
--------
27% increased Bolt Speed (implicit)
--------
Adds 1 to 23 Lightning Damage
+183 to Accuracy Rating
Grants 2 Life per Enemy Hit
Leeches 4.39% of Physical Damage as Mana`;

const sample_item8 = `Item Class: Quivers
Rarity: Unique
Blackgleam
Fire Quiver
--------
Requirements:
Level: 8
--------
Item Level: 72
--------
Adds 3 to 5 Fire damage to Attacks (implicit)
--------
+31 to maximum Mana
50% increased chance to Ignite
Projectiles Pierce all Ignited enemies
Attacks Gain 6% of Damage as Extra Fire Damage
--------
Molten feathers, veiled spark,
Hissing arrows from the dark.
--------
Can only be equipped if you are wielding a Bow.`;

const sample_item9 = `Item Class: Tablet
Rarity: Magic
Brimming Breach Precursor Tablet of Fissuring
--------
Item Level: 66
--------
5 Maps in Range contain Breaches (implicit)
--------
Your Maps which contain Breaches have 9% chance to contain an additional Breach
11% increased Rare Monsters in your Maps
--------
Can be used in a completed Tower on your Atlas to influence surrounding Maps. Tablets are consumed once placed into a Tower.
`;

const sample_item11 = `Item Class: Sceptres
Rarity: Unique
Font of Power
Omen Sceptre
--------
Spirit: 145 (augmented)
--------
Requirements:
Level: 72
Str: 50
Int: 128 (unmet)
--------
Item Level: 73
--------
45% increased Spirit
+60 to maximum Mana
20% increased Mana Regeneration Rate
When a Party Member in your Presence Casts a Spell, you
Sacrifice 20% of Mana and they Leech that Mana
--------
Tale-women may not fight directly,
for they have a much higher purpose.`;

const sample_item12 = `Item Class: Inscribed Ultimatum
Rarity: Currency
Inscribed Ultimatum
--------
Area Level: 75
Number of Trials: 10
--------
Item Level: 75
--------
Mortals spend their lives wondering which
fate shall be theirs. Chaos takes amusement
in knowing the answer: all of them.
--------
Take this item to The Temple of Chaos to participate in a Trial of Chaos.`;

test("blank clipboard", async () => {
  expect(async () => await parse("")).rejects.toThrowError("Not a Poe Item");
});

test("nonsense clipboard", async () => {
  expect(async () => await parse("ajf932bnfa32fb8abf")).rejects.toThrowError(
    "Not a Poe Item",
  );
});

// passes the scuffed isPoeItem check, should still error
test("nonsense clipboard 2", async () => {
  const payload = `asdfasdfasdfasdf
  ------
  asdfasdfasdf
  ------
  asdfasdfasdf
  ------
  asdfasdfasdf`;

  expect(async () => await parse(payload)).rejects.toThrowError(
    "Not a Poe Item",
  );
});

test("sample item 1", async () => {
  const parsedSampleItem = await parse(sample_item);
  expect(parsedSampleItem.itemClass).toBe("Body Armours");
  expect(parsedSampleItem.rarity).toBe("Rare");
  expect(parsedSampleItem.name).toBe("Tempest Cloak");
  expect(parsedSampleItem.quality).toBe(3);

  const s1: ItemStat = {
    type: "armour",
    value: 497,
  };
  expect(parsedSampleItem.stats).toContainEqual(s1);

  const a1 = {
    affix: [
      {
        poe_id: "explicit.stat_3299347043",
        rawText: "+212 to maximum Life",
        regex: /^\+?\d+(?:\.\d+)? to maximum Life$/g,
        type: "EXPLICIT",
      },
    ],
    roll: 212,
  };

  const { affixs } = parsedSampleItem;
  expect(affixs?.length).toBe(6);
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
        poe_id: "explicit.stat_803737631",
        rawText: "+38 to Accuracy Rating",
        regex: /^\+?\d+(?:\.\d+)? to (Accuracy|Accuracy) Rating$/g,
        type: "EXPLICIT",
      },
    ],
  };

  const { affixs } = parsedSampleItem;
  expect(affixs?.length).toBe(2);
  expect(affixs).toContainEqual(a1);
});

test("sample item 3", async () => {
  const parsedSampleItem = await parse(sample_item3);
  expect(parsedSampleItem.itemClass).toBe("Jewels");
  expect(parsedSampleItem.rarity).toBe("Rare");
  expect(parsedSampleItem.name).toBe("Entropy Bliss");
  expect(parsedSampleItem.stats?.length).toBe(0);

  const a1 = {
    roll: 15,
    affix: [
      {
        poe_id: "explicit.stat_3141070085",
        rawText: "15% increased Elemental Damage",
        regex:
          /^\+?\d+(?:\.\d+)?% (increased|reduced) (ElementalDamage|Elemental Damage)$/g,
        type: "EXPLICIT",
      },
    ],
  };

  const { affixs } = parsedSampleItem;
  expect(affixs?.length).toBe(4);
  expect(affixs).toContainEqual(a1);
});

test("sample item 4", async () => {
  const parsedSampleItem = await parse(sample_item4);
  expect(parsedSampleItem.itemClass).toBe("Helmets");
  expect(parsedSampleItem.rarity).toBe("Rare");
  expect(parsedSampleItem.name).toBe("Sol Ward");
  expect(parsedSampleItem.quality).toBe(18);

  const s1: ItemStat = {
    type: "armour",
    value: 312,
  };
  expect(parsedSampleItem.stats).toContainEqual(s1);

  const a1 = {
    roll: 15,
    affix: [
      {
        poe_id: "explicit.stat_3917489142",
        rawText: "15% increased Rarity of Items found",
        regex:
          /^\+?\d+(?:\.\d+)?% (increased|reduced) (ItemRarity|Rarity of Items) found$/g,
        type: "EXPLICIT",
      },
    ],
  };

  const { affixs } = parsedSampleItem;
  expect(affixs?.length).toBe(6);
  expect(affixs).toContainEqual(a1);
});

test("sample item 5", async () => {
  const parsedSampleItem = await parse(sample_item5);
  expect(parsedSampleItem.itemClass).toBe("Socketable");
  expect(parsedSampleItem.rarity).toBe("Currency");
  expect(parsedSampleItem.name).toBe("Soul Core of Topotante");
});

test("sample item 6", async () => {
  const parsedSampleItem = await parse(sample_item6);
  expect(parsedSampleItem.itemClass).toBe("Sceptres");
  expect(parsedSampleItem.rarity).toBe("Rare");
  expect(parsedSampleItem.name).toBe("Brood Smasher");
  const s1: ItemStat = {
    type: "spirit",
    value: 100,
  };
  expect(parsedSampleItem.stats).toContainEqual(s1);

  const a1 = {
    affix: [
      {
        poe_id: "explicit.stat_770672621",
        rawText: "Minions have 28% increased maximum Life",
        regex:
          /^(Minion|Minions) have \+?\d+(?:\.\d+)?% (increased|reduced) maximum Life$/g,
        type: "EXPLICIT",
      },
    ],
    roll: 28,
  };

  const a2 = {
    roll: 5.5,
    affix: [
      {
        type: "EXPLICIT",
        regex:
          /^(Allies|Allies) in your (Presence|Presence) deal \+?\d+(?:\.\d+)? to \+?\d+(?:\.\d+)? additional (Attack|Attack) (Lightning|Lightning) Damage$/g,
        poe_id: "explicit.stat_2854751904",
        rawText:
          "Allies in your Presence deal 1 to 10 additional Attack Lightning Damage",
      },
    ],
  };

  const { affixs } = parsedSampleItem;
  expect(affixs?.length).toBe(4);
  expect(affixs).toContainEqual(a1);
  expect(affixs).toContainEqual(a2);
});

test("sample item 7", async () => {
  const parsedSampleItem = await parse(sample_item7);
  expect(parsedSampleItem.itemClass).toBe("Sceptres");
  expect(parsedSampleItem.rarity).toBe("Rare");
  expect(parsedSampleItem.name).toBe("Apocalypse Smasher");
  const s1: ItemStat = {
    type: "spirit",
    value: 133,
  };
  expect(parsedSampleItem.stats).toContainEqual(s1);

  const a1 = {
    affix: [
      {
        poe_id: "explicit.stat_3169585282",
        rawText: "Allies in your Presence have +67 to Accuracy Rating",
        regex:
          /^(Allies|Allies) in your (Presence|Presence) have \+?\d+(?:\.\d+)? to (Accuracy|Accuracy) Rating$/g,
        type: "EXPLICIT",
      },
    ],
    roll: 67,
  };

  const a2 = {
    affix: [
      {
        poe_id: "explicit.stat_1998951374",
        rawText: "Allies in your Presence have 16% increased Attack Speed",
        regex:
          /^(Allies|Allies) in your (Presence|Presence) have \+?\d+(?:\.\d+)?% (increased|reduced) (Attack|Attack) Speed$/g,
        type: "EXPLICIT",
      },
    ],
    roll: 16,
  };

  const { affixs } = parsedSampleItem;
  expect(affixs?.length).toBe(3);
  expect(affixs).toContainEqual(a1);
  expect(affixs).toContainEqual(a2);
});

test("sample item 10", async () => {
  const parsedSampleItem = await parse(sample_item10);
  expect(parsedSampleItem.itemClass).toBe("Crossbows");
  expect(parsedSampleItem.rarity).toBe("Rare");
  expect(parsedSampleItem.name).toBe("Sorrow Core");
  const s1: ItemStat = {
    type: "physical-damage",
    value: 41.5,
  };
  const s2: ItemStat = {
    type: "lightning-damage",
    value: 12,
  };
  const s3: ItemStat = {
    type: "crit-chance",
    value: 5.0,
  };
  const s4: ItemStat = {
    type: "attacks-per-second",
    value: 1.6,
  };
  const s5: ItemStat = {
    type: "reload-time",
    value: 0.85,
  };
  expect(parsedSampleItem.stats).toContainEqual(s1);
  expect(parsedSampleItem.stats).toContainEqual(s2);
  expect(parsedSampleItem.stats).toContainEqual(s3);
  expect(parsedSampleItem.stats).toContainEqual(s4);
  expect(parsedSampleItem.stats).toContainEqual(s5);
});

test("sample item 8", async () => {
  const parsedSampleItem = await parse(sample_item8);
  expect(parsedSampleItem.itemClass).toBe("Quivers");
  expect(parsedSampleItem.rarity).toBe("Unique");
  expect(parsedSampleItem.name).toBe("Blackgleam");

  const a1 = {
    affix: [
      {
        poe_id: "implicit.stat_1573130764",
        rawText: "Adds 3 to 5 Fire damage to Attacks",
        regex:
          /^Adds \+?\d+(?:\.\d+)? to \+?\d+(?:\.\d+)? (Fire) damage to (Attack|Attacks)$/g,
        type: "IMPLICIT",
      },
    ],
    roll: 4,
  };

  expect(parsedSampleItem.implicit).toContainEqual(a1);

  const { affixs } = parsedSampleItem;
  expect(affixs?.length).toBe(4);
});

test("sample item 9", async () => {
  const parsedSampleItem = await parse(sample_item9);
  expect(parsedSampleItem.itemClass).toBe("Tablet");
  expect(parsedSampleItem.rarity).toBe("Magic");
  expect(parsedSampleItem.name).toBe(
    "Brimming Breach Precursor Tablet of Fissuring",
  );

  const a1 = {
    affix: [
      {
        poe_id: "implicit.stat_2219129443",
        rawText: "5 Maps in Range contain Breaches",
        regex:
          /^\+?\d+(?:\.\d+)? Maps in Range contain (ContainsBreach|Breaches)$/g,
        type: "IMPLICIT",
      },
    ],
    roll: 5,
  };

  expect(parsedSampleItem.implicit).toContainEqual(a1);

  const { affixs } = parsedSampleItem;
  expect(affixs?.length).toBe(0);
});

test("sample item 11", async () => {
  const parsedSampleItem = await parse(sample_item11);
  expect(parsedSampleItem.itemClass).toBe("Sceptres");
  expect(parsedSampleItem.rarity).toBe("Unique");
  expect(parsedSampleItem.name).toBe("Font of Power");

  const a1 = {
    affix: [
      {
        poe_id: "explicit.stat_603021645",
        rawText:
          "When a Party Member in your Presence Casts a Spell, you\nSacrifice 20% of Mana and they Leech that Mana",
        regex:
          /^When a Party Member in your (Presence) Casts a (Spell), you\n(Sacrifice) \+?\d+(?:\.\d+)?% of Mana and they (ManaLeech|Leech that Mana)$/g,
        type: "EXPLICIT",
      },
    ],
    roll: 20,
  };

  const { affixs } = parsedSampleItem;
  console.log(JSON.stringify(affixs));
  expect(affixs).toContainEqual(a1);
});

test("sample item 12", async () => {
  const parsedSampleItem = await parse(sample_item12);
  expect(parsedSampleItem.itemClass).toBe("Inscribed Ultimatum");
  expect(parsedSampleItem.rarity).toBe("Currency");
  expect(parsedSampleItem.name).toBe("Inscribed Ultimatum");
  expect(parsedSampleItem.areaLevel).toBe(75);

  const { affixs } = parsedSampleItem;
  expect(affixs?.length).toBe(undefined);
});
