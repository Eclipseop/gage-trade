import axios from "axios";

interface AffixInfoResponse {
  result: {
    id: ID;
    label: string;
    entries: Entry[];
  }[];
}

interface Entry {
  id: string;
  text: string;
  type: ID;
  option?: {
    options: OptionElement[];
  };
}

interface OptionElement {
  id: number;
  text: string;
}

enum ID {
  Enchant = "enchant",
  Explicit = "explicit",
  Implicit = "implicit",
  Rune = "rune",
  Sanctum = "sanctum",
  Skill = "skill",
}

class AffixInfoFetcher {
  private static instance: AffixInfoFetcher;
  private cachedData: (Entry & { mappedRegex: RegExp })[] | null = null;
  private readonly API_URL =
    "https://www.pathofexile.com/api/trade2/data/stats";

  public static getInstance(): AffixInfoFetcher {
    if (!AffixInfoFetcher.instance) {
      AffixInfoFetcher.instance = new AffixInfoFetcher();
    }
    return AffixInfoFetcher.instance;
  }

  public async fetchAffixInfo(): Promise<(Entry & { mappedRegex: RegExp })[]> {
    try {
      if (this.cachedData) {
        return this.cachedData;
      }
      const response = await axios.get<AffixInfoResponse>(this.API_URL, {
        headers: {
          "User-Agent": "Gage Trade",
          Accept: "application/json",
        },
      });

      const parsedStats = response.data.result.flatMap((result) =>
        result.entries.map((entry) => {
          const transformedText = entry.text
            .replace(/\[([^\]]+)\]/g, (match, group: string) => {
              const sortedElements = group
                .split(",")
                .map((el) => el.trim())
                .sort((a, b) => a.length - b.length);
              return `(${sortedElements.join("|")})`;
            })
            .replaceAll("+", "\\+")
            .replace("increased", "(increased|reduced)")
            .replaceAll("#", "\\+?\\d+(?:\\.\\d+)?");

          const mappedRegex = new RegExp(`^${transformedText}$`, "g");

          return {
            ...entry,
            mappedRegex,
          };
        }),
      );

      this.cachedData = parsedStats;

      return parsedStats;
    } catch (error) {
      console.error(error);
      throw new Error("Failed to get stats info!");
    }
  }
}

export default AffixInfoFetcher;
