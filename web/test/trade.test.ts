import { buildQuery } from "@/trade/trade";
import type {
  AffixInfo,
  SearchableItemData,
  SearchableStat,
} from "@/types/parser";
import { describe, expect, test } from "vitest";

describe("buildQuery", () => {
  test("handles currency items correctly", () => {
    const currencyItem: SearchableItemData = {
      rarity: {
        included: true,
        value: "Currency",
      },
      name: {
        included: true,
        value: "Divine Orb",
      },
      itemClass: {
        included: true,
        value: "Currency",
      },
      stats: { included: false, value: [] },
      implicit: { included: false, value: [] },
      affixs: { included: false, value: [] },
      enchant: { included: false, value: [] },
    };

    const query = buildQuery(currencyItem);
    expect(query.query.type).toBe("Divine Orb");
    expect(query.query.name).toBeUndefined();
  });

  test("handles currency items correctly rarity not explicity included", () => {
    const currencyItem: SearchableItemData = {
      rarity: {
        included: false,
        value: "Currency",
      },
      name: {
        included: true,
        value: "Divine Orb",
      },
      itemClass: {
        included: true,
        value: "Currency",
      },
      stats: { included: false, value: [] },
      implicit: { included: false, value: [] },
      affixs: { included: false, value: [] },
      enchant: { included: false, value: [] },
    };

    const query = buildQuery(currencyItem);
    expect(query.query.type).toBe("Divine Orb");
    expect(query.query.name).toBeUndefined();
  });

  test("handles unique items with name correctly", () => {
    const uniqueItem: SearchableItemData = {
      rarity: {
        included: true,
        value: "Unique",
      },
      name: {
        included: true,
        value: "Headhunter",
      },
      itemClass: {
        included: true,
        value: "Belts",
      },
      stats: { included: false, value: [] },
      implicit: { included: false, value: [] },
      affixs: { included: false, value: [] },
      enchant: { included: false, value: [] },
    };

    const query = buildQuery(uniqueItem);
    expect(query.query.name).toBe("Headhunter");
    expect(query.query.filters.type_filters?.filters.category?.option).toBe(
      "accessory.belt",
    );
  });

  test("handles unique items with name correctly rarity not explicity included", () => {
    const uniqueItem: SearchableItemData = {
      rarity: {
        included: false,
        value: "Unique",
      },
      name: {
        included: true,
        value: "Headhunter",
      },
      itemClass: {
        included: true,
        value: "Belts",
      },
      stats: { included: false, value: [] },
      implicit: { included: false, value: [] },
      affixs: { included: false, value: [] },
      enchant: { included: false, value: [] },
    };

    const query = buildQuery(uniqueItem);
    console.log(JSON.stringify(query));
    expect(query.query.name).toBe("Headhunter");
    expect(query.query.filters.type_filters?.filters.category?.option).toBe(
      "accessory.belt",
    );
  });

  test("handles equipment stats filters", () => {
    const stats: SearchableStat[] = [
      {
        included: true,
        type: "energy-shield",
        value: 523,
        range: {
          min: 523,
        },
      },
    ];

    const statItem: SearchableItemData = {
      itemClass: {
        included: true,
        value: "Body Armours",
      },
      stats: {
        included: true,
        value: stats,
      },
      name: { included: false, value: "" },
      rarity: { included: false, value: "Normal" },
      implicit: { included: false, value: [] },
      affixs: { included: false, value: [] },
      enchant: { included: false, value: [] },
    };

    const query = buildQuery(statItem);
    expect(query.query.filters.equipment_filters?.filters.es?.min).toBe(523);
  });

  test("handles affix search filters", () => {
    const affixInfo: AffixInfo = {
      poe_id: "pseudo.pseudo_total_life",
      regex: /\+(\d+) to maximum Life/,
      type: "EXPLICIT",
      rawText: "+# to maximum Life",
    };

    const affixItem: SearchableItemData = {
      itemClass: {
        included: true,
        value: "Body Armours",
      },
      affixs: {
        included: true,
        value: [
          {
            included: true,
            range: {
              min: 80,
            },
            affix: [affixInfo],
          },
        ],
      },
      name: { included: false, value: "" },
      rarity: { included: false, value: "Normal" },
      stats: { included: false, value: [] },
      implicit: { included: false, value: [] },
      enchant: { included: false, value: [] },
    };

    const query = buildQuery(affixItem);
    expect(query.query.stats[0]).toEqual({
      type: "and",
      filters: [
        {
          id: "pseudo.pseudo_total_life",
          disabled: false,
          value: { min: 80 },
        },
      ],
    });
  });

  test("handles multiple affixes with count type", () => {
    const affixes: AffixInfo[] = [
      {
        poe_id: "explicit.stat_3372524247",
        regex: /\+(\d+)% to Fire Resistance/,
        type: "EXPLICIT",
        rawText: "+#% to Fire Resistance",
      },
      {
        poe_id: "explicit.stat_1671376347",
        regex: /\+(\d+)% to Lightning Resistance/,
        type: "EXPLICIT",
        rawText: "+#% to Lightning Resistance",
      },
    ];

    const multiAffixItem: SearchableItemData = {
      itemClass: {
        included: true,
        value: "Body Armours",
      },
      affixs: {
        included: true,
        value: [
          {
            included: true,
            range: {
              min: 30,
            },
            affix: affixes,
          },
        ],
      },
      name: { included: false, value: "" },
      rarity: { included: false, value: "Normal" },
      stats: { included: false, value: [] },
      implicit: { included: false, value: [] },
      enchant: { included: false, value: [] },
    };

    const query = buildQuery(multiAffixItem);
    expect(query.query.stats[0]).toEqual({
      type: "count",
      filters: [
        {
          id: "explicit.stat_3372524247",
          disabled: false,
          value: { min: 30 },
        },
        {
          id: "explicit.stat_1671376347",
          disabled: false,
          value: { min: 30 },
        },
      ],
      value: { min: 1 },
    });
  });

  test("handles special area level cases for ultimatums", () => {
    const ultimatumItem: SearchableItemData = {
      itemClass: {
        included: true,
        value: "Inscribed Ultimatum",
      },
      areaLevel: {
        included: true,
        value: 75,
        range: {
          min: 75,
        },
      },
      name: { included: false, value: "" },
      rarity: { included: false, value: "Normal" },
      stats: { included: false, value: [] },
      implicit: { included: false, value: [] },
      affixs: { included: false, value: [] },
      enchant: { included: false, value: [] },
    };

    const query = buildQuery(ultimatumItem);
    expect(query.query.filters.type_filters?.filters.ilvl?.min).toBe(75);
    expect(
      query.query.filters.misc_filters?.filters.area_level,
    ).toBeUndefined();
  });

  test("throws error for unknown item class", () => {
    const invalidItem: SearchableItemData = {
      itemClass: {
        included: true,
        value: "Invalid Class",
      },
      name: { included: false, value: "" },
      rarity: { included: false, value: "Normal" },
      stats: { included: false, value: [] },
      implicit: { included: false, value: [] },
      affixs: { included: false, value: [] },
      enchant: { included: false, value: [] },
    };

    expect(() => buildQuery(invalidItem)).toThrow(
      "Unknown item class: Invalid Class",
    );
  });
});
