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
  private cachedData: (Entry & { mappedRegex: RegExp })[] | null = null;
  private readonly API_URL =
    "https://www.pathofexile.com/api/trade2/data/stats";

  public static getInstance(): TradeStatsFetcher {
    if (!TradeStatsFetcher.instance) {
      TradeStatsFetcher.instance = new TradeStatsFetcher();
    }
    return TradeStatsFetcher.instance;
  }

  public async fetchTradeStats(): Promise<(Entry & { mappedRegex: RegExp })[]> {
    try {
      if (this.cachedData) {
        return this.cachedData;
      }
      const response = await axios.get<TradeStatsResponse>(this.API_URL, {
        headers: {
          "User-Agent": "POE Trade Stats Fetcher",
          Accept: "application/json",
        },
      });

      const parsedStats = response.data.result[0].entries.map((em) => ({
        ...em,
        mappedRegex: new RegExp(
          em.text
            .replace(/\[([^\]]+)\]/g, (match, group: string) => {
              const sortedElements = group
                .split(",")
                .map((el: string) => el.trim())
                .sort((a, b) => a.length - b.length);
              return `(${sortedElements.join("|")})`;
            })
            .replaceAll("+", "\\+")
            .replace("increased", "(increased|reduced)")
            .replaceAll("#", "\\d+(?:\\.\\d+)?")
        ),
      }));

      this.cachedData = parsedStats;

      return parsedStats;
    } catch (error) {
      throw new Error("Failed to get item stats info!");
    }
  }
}

export default TradeStatsFetcher;
