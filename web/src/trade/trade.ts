import type { SearchableAffix, SearchableItemData } from "@/types/parser";
import { getApi } from "@/util/electron";
import axios, { AxiosError } from "axios";

const FETCH_TRADE_API = "https://www.pathofexile.com/api/trade2/fetch";

type StatFilter = {
  id: string;
  value?: {
    min?: number;
    max?: number;
  };
  disabled: boolean;
};

type StatGroup = {
  type: "and" | "count";
  value?: {
    min: number;
  };
  filters: StatFilter[];
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
      rarity?: {
        option: string;
      };
      quality?: {
        min?: number;
      };
      ilvl?: {
        min?: number;
      };
    };
  };
  equipment_filters?: {
    filters: {
      [key: string]: {
        min?: number;
        max?: number;
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
    type?: string;
    status: {
      option: string;
    };
    stats: StatGroup[];
    filters: Filter;
  };
  sort: {
    price: "asc" | "desc";
  };
};

export type TradeListing = PoeItemLookupResult["result"][number];

function processAffixes(affixes: SearchableAffix[]): StatGroup[] {
  return affixes
    .filter((affix) => affix.included)
    .map((affix) => ({
      type: affix.affix.length === 1 ? "and" : "count",
      filters: affix.affix.map((a) => ({
        id: a.poe_id,
        disabled: false,
        value: affix.range,
      })),
      ...(affix.affix.length > 1 && { value: { min: 1 } }),
    }));
}

export function buildQuery(item: SearchableItemData): PoeQuery {
  const query: PoeQuery = {
    query: {
      status: { option: "online" },
      stats: [],
      filters: {
        type_filters: { filters: {} },
        equipment_filters: { filters: {} },
        misc_filters: { filters: {} },
        map_filters: { filters: {} },
      },
    },
    sort: { price: "asc" },
  };

  if (item.rarity.value === "Currency") {
    query.query.type = item.name.value;
  }
  if (item.rarity.value === "Unique") {
    query.query.name = item.name.value;
  }

  if (item.rarity.included) {
    query.query.filters.type_filters!.filters.rarity = {
      option: item.rarity.value.toLowerCase(),
    };
  }

  if (item.itemClass.included) {
    const mappedClass = itemClassMap[item.itemClass.value];
    if (!mappedClass)
      throw new Error(`Unknown item class: ${item.itemClass.value}`);
    query.query.filters.type_filters!.filters.category = {
      option: mappedClass,
    };
  }

  if (item.quality?.included) {
    query.query.filters.type_filters!.filters.quality = {
      min: item.quality.range.min,
    };
  }

  if (item.itemLevel?.included) {
    query.query.filters.type_filters!.filters.ilvl = {
      min: item.itemLevel.range.min,
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
    const isSpecialItem = ["Inscribed Ultimatum", "Trial Coins"].includes(
      item.itemClass.value,
    );
    if (isSpecialItem) {
      query.query.filters.type_filters!.filters.ilvl = {
        min: item.areaLevel.value,
      };
    } else {
      query.query.filters.misc_filters!.filters.area_level = {
        min: item.areaLevel.value,
      };
    }
  }

  // Process stats
  if (item.stats?.included) {
    const includedStats = item.stats.value.filter((stat) => stat.included);
    for (const stat of includedStats) {
      const mappedStat = StatTypes.find((st) => st.key === stat.type);
      if (mappedStat) {
        query.query.filters.equipment_filters!.filters[mappedStat.term] = {
          min: stat.range.min,
        };
      }
    }
  }

  // Process affixes
  if (item.affixs?.included) {
    query.query.stats.push(...processAffixes(item.affixs.value));
  }

  if (item.implicit?.included) {
    query.query.stats.push(...processAffixes(item.implicit.value));
  }

  if (item.enchant?.included) {
    query.query.stats.push(...processAffixes(item.enchant.value));
  }

  return query;
}

class TradeAPI {
  private TRADE_API_URL: string;
  private TRADE_QUERY_URL: string;

  constructor(private league: string) {
    this.TRADE_API_URL = `https://www.pathofexile.com/api/trade2/search/poe2/${this.league}`;
    this.TRADE_QUERY_URL = `https://www.pathofexile.com/trade2/search/poe2/${this.league}`;
  }

  setLeague(league: string) {
    this.TRADE_API_URL = `https://www.pathofexile.com/api/trade2/search/poe2/${league}`;
    this.TRADE_QUERY_URL = `https://www.pathofexile.com/trade2/search/poe2/${league}`;
  }

  async lookup(item: SearchableItemData): Promise<TradeListing[]> {
    try {
      const query = buildQuery(item);

      console.log(JSON.stringify(query));
      const { data } = await axios.post<PoeBaseSearchResult>(
        this.TRADE_API_URL,
        query,
      );
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
  }

  async openTradeQuery(item: SearchableItemData) {
    const query = buildQuery(item);

    console.log(JSON.stringify(query));
    const { data } = await axios.post<PoeBaseSearchResult>(
      this.TRADE_API_URL,
      query,
    );
    const url = `${this.TRADE_QUERY_URL}/${data.id}`;
    getApi().send("trade", { url });
  }
}

export const tradeApi = new TradeAPI("standard");
