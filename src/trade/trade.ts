import axios from "axios";
import { ItemData } from "../item-parser";

const TRADE_API = "https://www.pathofexile.com/api/trade2/search/poe2/Standard";
const FETCH_TRADE_API = "https://www.pathofexile.com/api/trade2/fetch";

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

export const lookup = async (item: ItemData) => {
  let query = {
    query: {
      status: {
        option: "online",
      },
      stats: [] as StatFiler[],
      filters: {},
    },
    sort: {
      price: "asc",
    },
  };

  for (let affix of item.affixs) {
    query.query.stats.push({
      type: affix.affix.length === 1 ? "and" : "count",
      filters: affix.affix.map((a) => ({
        id: a.poe_id,
        value: { min: affix.roll },
      })),
      ...(affix.affix.length > 1 && { value: { min: 1 } }),
      // filters: [{ id: poe_id, value: { min: affix.roll } }],
    });
  }

  console.log(JSON.stringify(query));
  const { data } = await axios.post<PoeBaseSearchResult>(TRADE_API, query, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36",
    },
  });
  console.log(`[DEBUG] Found ${data.result.length} items`);
  if (data.result.length === 0) {
    return undefined;
  }
  const itemLookupRes = await axios.get<PoeItemLookupResult>(
    `${FETCH_TRADE_API}/${data.result.slice(0, 10).join(",")}`,
    {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36",
      },
    }
  );
  for (let fetchLookup of itemLookupRes.data.result) {
    console.log(fetchLookup.listing.whisper);
  }

  // const res = await axios.post(TRADE_API, {
  //   query: {},
  // });
};
