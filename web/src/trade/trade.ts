import type {
  RollableSearchableAffix,
  SearchableArray,
  SearchableItemData,
} from "@/types/parser";
import { getApi } from "@/util/electron";
import axios, { AxiosError } from "axios";

const NORMAL_TRADE_URL =
  "https://www.pathofexile.com/trade2/search/poe2/Standard";
const TRADE_API = "https://www.pathofexile.com/api/trade2/search/poe2/Standard";
const FETCH_TRADE_API = "https://www.pathofexile.com/api/trade2/fetch";

export type StatFiler = {
  type: "and" | "count";
  filters: {
    id: string;
    disabled: boolean;
    value?: {
      min?: number;
      max?: number;
    };
  }[];
};

const StatTypes = [
  {
    key: "armour",
    term: "ar",
  },
  {
    key: "evasion",
    term: "ev",
  },
  {
    key: "energy-shield",
    term: "es",
  },
  {
    key: "block",
    term: "block",
  },
  {
    key: "spirit",
    term: "spirit",
  },
  {
    key: "physical-damage-dps",
    term: "pdps",
  },
  {
    key: "total-dps",
    term: "dps",
  },
  {
    key: "total-edps",
    term: "edps",
  },
  {
    key: "attacks-per-second",
    term: "aps",
  },
] as const;

export type Filter = {
  type_filters?: {
    filters: {
      category?: {
        option: string;
      };
      quality?: {
        min?: number;
      };
      ilvl?: {
        min?: number;
      };
      rarity?: {
        option?: string;
      };
    };
  };
  equipment_filters?: {
    filters: {
      [key in (typeof StatTypes)[number]["term"] | "rune_sockets"]?: {
        min?: number;
      };
    };
  };
  map_filters?: {
    filters: {
      map_tier?: {
        min: number;
      };
    };
  };
  misc_filters?: {
    filters: {
      area_level?: {
        min?: number;
      };
    };
  };
};

export type PoeBaseSearchResult = {
  id: string;
  complexity: number;
  result: string[];
  total: number;
  inexact: boolean;
};

export type PoeItemListing = {
  method: string;
  indexed: string;
  stash: {
    name: string;
    x: number;
    y: number;
  };
  whisper: string;
  account: {
    name: string;
    online: {
      league: string;
    };
    lastCharacterName: string;
    language: string;
    realm: string;
  };
  price: {
    type: string;
    amount: number;
    currency: string;
  };
};

// probably come up w/ a better name
export type PoeItem = {
  realm: string;
  verified: boolean;
  w: number;
  h: number;
  icon: string;
  league: string;
  id: string;
  name: string;
  typeLine: string;
  baseType: string;
  rarity: string;
  ilvl: number;
  identified: boolean;
  note: string;
  properties: Array<{
    name: string;
    values: Array<[string, number]>;
    displayMode: number;
    type?: number;
  }>;
  requirements: Array<{
    name: string;
    values: Array<[string, number]>;
    displayMode: number;
    type: number;
  }>;
  explicitMods?: Array<string>;
  frameType: number;
  extended: {
    es: number;
    es_aug: boolean;
    mods: {
      explicit: Array<{
        name: string;
        tier: string;
        level: number;
        magnitudes: Array<{
          hash: string;
          min: string;
          max: string;
        }>;
      }>;
    };
    hashes: {
      explicit: Array<[string, Array<number>]>;
    };
  };
};

export type PoeItemLookupResult = {
  result: Array<{
    id: string;
    listing: PoeItemListing;
    item: PoeItem;
  }>;
};

const itemClassMap: { [key: string]: string } = {
  "Body Armours": "armour.chest",
  Boots: "armour.boots",
  Gloves: "armour.gloves",
  Helmets: "armour.helmet",
  Shields: "armour.shield",
  Belts: "accessory.belt",
  Rings: "accessory.ring",
  Amulets: "accessory.amulet",
  Quivers: "accessory.quiver",
  Flasks: "consumable.flask",
  Maps: "map",
  "Map Fragments": "map.fragment",
  Jewels: "jewel",
  "Abyss Jewels": "jewel.abyss",
  "Cluster Jewels": "jewel.cluster",
  Currency: "currency",
  "Divination Cards": "card.divination",
  "Skill Gems": "gem.active",
  "Support Skill Gems": "gem.support",
  "Fishing Rods": "weapon.fishingrod",
  Daggers: "weapon.dagger",
  Claws: "weapon.claw",
  "One Hand Swords": "weapon.onesword",
  "Two Hand Swords": "weapon.twosword",
  "One Hand Axes": "weapon.oneaxe",
  "Two Hand Axes": "weapon.twoaxe",
  "One Hand Maces": "weapon.onemace",
  "Two Hand Maces": "weapon.twomace",
  Bows: "weapon.bow",
  Staves: "weapon.staff",
  Warstaves: "weapon.warstaff",
  Wands: "weapon.wand",
  Sceptres: "weapon.sceptre",
  "Rune Daggers": "weapon.runedagger",
  "Thrusting One Hand Swords": "weapon.thrustsword",
  Trinkets: "trinket",
  "Heist Brooches": "heist.brooch",
  "Heist Cloaks": "heist.cloak",
  "Heist Tools": "heist.tool",
  "Heist Contracts": "heist.contract",
  "Heist Blueprints": "heist.blueprint",
  Incubators: "misc.incubator",
  Scarab: "misc.scarab",
  "Metamorph Samples": "misc.metamorph",
  "Delve Resonators": "delve.resonator",
  "Delve Fossils": "delve.fossil",
  Prophecies: "prophecy",
  Vials: "misc.vial",
  Watchstones: "misc.watchstone",
  Sentinel: "sentinel",
  "Expedition Logbooks": "expedition.logbook",
  "Expedition Artifacts": "expedition.artifact",
  Beasts: "beast",
  Crossbows: "weapon.crossbow",
  Quarterstaves: "weapon.warstaff",
  "Inscribed Ultimatum": "map.ultimatum",
  "Trial Coins": "map.barya",
  Waystones: "map.waystone",
  Tablet: "map.tablet",
  Foci: "armour.focus",
};

export type PoeQuery = {
  query: {
    name?: string;
    status: {
      option: string;
    };
    stats: StatFiler[];
    filters: Filter;
    type?: string;
  };
  sort: {
    price: "asc" | "desc";
  };
};

export const buildQuery = (item: SearchableItemData): PoeQuery => {
  const query: PoeQuery = {
    query: {
      status: {
        option: "online",
      },
      stats: [],
      filters: {
        equipment_filters: {
          filters: {},
        },
        type_filters: {
          filters: {
            category: undefined,
            quality: undefined,
            ilvl: undefined,
          },
        },
        misc_filters: {
          filters: {},
        },
        map_filters: {
          filters: {},
        },
      },
    },
    sort: {
      price: "asc",
    },
  };

  if (item.rarity?.value === "Currency") {
    query.query.type = item.name.value;
  }
  if (item.rarity?.value === "Unique") {
    query.query.name = item.name.value;
  }

  if (item.rarity?.included) {
    query.query.filters.type_filters!.filters.rarity = {
      option: item.rarity.value.toLowerCase(),
    };
  }

  // Check if itemClass is included
  if (item.itemClass?.included) {
    const mappedItemClass = itemClassMap[item.itemClass.value];
    if (!mappedItemClass) {
      throw new Error(`Unknown item class? monka! ${item.itemClass.value}`);
    }
    query.query.filters.type_filters!.filters.category = {
      option: mappedItemClass,
    };
  }

  if (item.quality?.included) {
    query.query.filters.type_filters!.filters.quality = {
      min: item.quality.value,
    };
  }

  if (item.itemLevel?.included) {
    query.query.filters.type_filters!.filters.ilvl = {
      min: item.itemLevel.value,
    };
  }

  if (item.waystoneTier?.included) {
    query.query.filters.map_filters!.filters.map_tier = {
      min: item.waystoneTier.value,
    };
  }

  if (item.numRuneSockets?.included) {
    query.query.filters.equipment_filters!.filters.rune_sockets = {
      min: item.numRuneSockets.value,
    };
  }

  if (item.areaLevel?.included) {
    // ok for some reason ultimatiums / djinn barya items say area level, but you need to search using item level
    // ggg fix ur game
    if (
      item.itemClass.value === "Inscribed Ultimatum" ||
      item.itemClass.value === "Trial Coins"
    ) {
      query.query.filters.type_filters!.filters.ilvl = {
        min: item.areaLevel?.value,
      };
    } else {
      query.query.filters.misc_filters!.filters.area_level = {
        min: item.areaLevel.value,
      };
    }
  }

  for (const stat of item.stats?.value ?? []) {
    if (!stat.included) continue;

    const mappedStatType = StatTypes.find((st) => st.key === stat.type);
    if (!mappedStatType) continue;

    query.query.filters.equipment_filters!.filters[mappedStatType?.term] = {
      min: stat.value,
    };
  }

  const processAffixes = (
    affixes: SearchableArray<RollableSearchableAffix>["value"],
  ) => {
    for (const affix of affixes) {
      // Only process if this affix is included in the search
      if (!affix.included) continue;

      query.query.stats.push({
        type: affix.affix.length === 1 ? "and" : "count",
        filters: affix.affix.map((a) => ({
          id: a.poe_id,
          disabled: false, // Since we're only processing included affixes, this is always false
          value: { min: affix.roll },
        })),
        ...(affix.affix.length > 1 && { value: { min: 1 } }),
      });
    }
  };

  // Process affixes if they exist
  if (item.affixs?.value) {
    processAffixes(item.affixs.value);
  }

  // Process implicit if they exist
  if (item.implicit?.value) {
    processAffixes(item.implicit.value);
  }

  if (item.enchant?.value) {
    processAffixes(item.enchant.value);
  }

  return query;
};

export const openTradeQuery = async (item: SearchableItemData) => {
  const query = buildQuery(item);

  console.log(JSON.stringify(query));
  const { data } = await axios.post<PoeBaseSearchResult>(TRADE_API, query);
  const url = `${NORMAL_TRADE_URL}/${data.id}`;
  getApi().send("trade", { url });
};

export type TradeListing = PoeItemLookupResult["result"][number];

export const lookup = async (
  item: SearchableItemData,
): Promise<TradeListing[]> => {
  try {
    const query = buildQuery(item);

    console.log(JSON.stringify(query));
    const { data } = await axios.post<PoeBaseSearchResult>(TRADE_API, query);
    console.log(`[DEBUG] Found ${data.result.length} items`);
    if (data.result.length === 0) {
      return [];
    }
    const itemLookupRes = await axios.get<PoeItemLookupResult>(
      `${FETCH_TRADE_API}/${data.result.slice(0, 10).join(",")}`,
    );
    return itemLookupRes.data.result;
  } catch (err) {
    console.log(err);
    let msg = "Error...";
    if (err instanceof AxiosError) {
      const axiosErr = err as AxiosError;
      if (Number(axiosErr.status) === 429) {
        msg = "Rate limited";
      }
    }
    return Promise.reject(msg);
  }
};
