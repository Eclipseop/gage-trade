import axios from "axios";

export interface TradeStatsResponse {
  result: Result[];
}

export interface Result {
  id: ID;
  label: string;
  entries: Entry[];
}

export interface Entry {
  id: string;
  text: string;
  type: ID;
  option?: EntryOption;
}

export interface EntryOption {
  options: OptionElement[];
}

export interface OptionElement {
  id: number;
  text: string;
}

export enum ID {
  Enchant = "enchant",
  Explicit = "explicit",
  Implicit = "implicit",
  Rune = "rune",
  Sanctum = "sanctum",
  Skill = "skill",
}

class TradeStatsFetcher {
  private static instance: TradeStatsFetcher;
  private cachedData: TradeStatsResponse | null = null;
  private readonly API_URL =
    "https://www.pathofexile.com/api/trade2/data/stats";

  public static getInstance(): TradeStatsFetcher {
    if (!TradeStatsFetcher.instance) {
      TradeStatsFetcher.instance = new TradeStatsFetcher();
    }
    return TradeStatsFetcher.instance;
  }

  public async fetchTradeStats(): Promise<TradeStatsResponse> {
    try {
      const response = await axios.get<TradeStatsResponse>(this.API_URL, {
        headers: {
          "User-Agent": "POE Trade Stats Fetcher",
          Accept: "application/json",
        },
      });

      this.cachedData = response.data;

      return response.data;
    } catch (error) {
      if (this.cachedData) {
        console.warn(
          "Failed to fetch new data, returning cached version",
          error,
        );
      }

      throw error;
    }
  }
}

export default TradeStatsFetcher;
