import axios from "axios";
import { api } from "../util/electron";

const NORMAL_TRADE_URL =
  "https://www.pathofexile.com/trade2/search/poe2/Standard";
const TRADE_API = "https://www.pathofexile.com/api/trade2/search/poe2/Standard";
const FETCH_TRADE_API = "https://www.pathofexile.com/api/trade2/fetch";

export type ItemData = {
  name: string;
  rarity: string;
  itemClass: string; // TODO create enum hehe
  base: string; // todo create enum ehhe
  affixs: {
    affix: AffixInfo[];
    roll: number;
  }[];
};

export type AffixInfo = {
  common_name: string;
  poe_id: string;
  regex: RegExp;
  type: "EXPLICIT" | "IMPLICIT";
  rawText?: string;
};

type StatFiler = {
  type: "and" | "count";
  filters: {
    id: string;
    value?: {
      min?: number;
      max?: number;
    };
  }[];
};

type Filter = {
  type_filters: {
    filters: {
      category: {
        option: string;
      };
    };
  };
};

type PoeBaseSearchResult = {
  id: string;
  complexity: number;
  result: string[];
  total: number;
  inexact: boolean;
};

export type PoeItemLookupResult = {
  result: Array<{
    id: string;
    listing: {
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
    item: {
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
      explicitMods: Array<string>;
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
  }>;
};

const itemClassMap: { [key: string]: string } = {
  "Body Armours": "armour.chest",
  Boots: "armour.boots",
  Gloves: "armour.gloves",
  Helmets: "armour.helm",
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
};

const buildQuery = (item: ItemData) => {
  const query = {
    query: {
      status: {
        option: "online",
      },
      stats: [] as StatFiler[],
      filters: {} as Filter,
    },
    sort: {
      price: "asc",
    },
  };

  console.log("hello lol");

  if (item.itemClass) {
    const mappedItemClass = itemClassMap[item.itemClass];
    if (!mappedItemClass) {
      throw new Error("Unknown item class? monka!");
    }
    query.query.filters = {
      type_filters: {
        filters: { category: { option: itemClassMap[item.itemClass] } },
      },
    };
  }
  console.log("hello lol?????");

  for (const affix of item.affixs) {
    query.query.stats.push({
      type: affix.affix.length === 1 ? "and" : "count",
      filters: affix.affix.map((a) => ({
        id: a.poe_id,
        value: { min: affix.roll },
      })),
      ...(affix.affix.length > 1 && { value: { min: 1 } }),
    });
  }
  return query;
};

export const openTradeQuery = async (item: ItemData) => {
  const query = buildQuery(item);

  console.log(JSON.stringify(query));
  const { data } = await axios.post<PoeBaseSearchResult>(TRADE_API, query);
  const url = `${NORMAL_TRADE_URL}/${data.id}`;
  api.send("trade", { url });
};

export const lookup = async (item: ItemData) => {
  const query = buildQuery(item);

  console.log(JSON.stringify(query));
  const { data } = await axios.post<PoeBaseSearchResult>(TRADE_API, query);
  console.log(`[DEBUG] Found ${data.result.length} items`);
  if (data.result.length === 0) {
    return undefined;
  }
  const itemLookupRes = await axios.get<PoeItemLookupResult>(
    `${FETCH_TRADE_API}/${data.result.slice(0, 10).join(",")}`,
  );
  return itemLookupRes.data.result;
};
