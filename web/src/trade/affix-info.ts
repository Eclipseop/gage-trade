import axios from "axios";

interface AffixInfoResponse {
  result: {
    id: ID;
    label: string;
    entries: Entry[];
  }[];
}

export interface Entry {
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

export type AffixEntry = Entry & { mappedRegex: RegExp };

class AffixInfoFetcher {
  private static instance: AffixInfoFetcher;
  private cachedData: AffixEntry[] | null = null;
  private readonly API_URL =
    "https://www.pathofexile.com/api/trade2/data/stats";

  public static getInstance(): AffixInfoFetcher {
    if (!AffixInfoFetcher.instance) {
      AffixInfoFetcher.instance = new AffixInfoFetcher();
    }
    return AffixInfoFetcher.instance;
  }

  public async fetchAffixInfo(): Promise<AffixEntry[]> {
    try {
      if (this.cachedData) {
        console.log("Returning affix-info from cache");
        return this.cachedData;
      }
      const response = await axios.get<AffixInfoResponse>(this.API_URL, {
        headers: {
          ...(process.env.NODE_ENV === "test" && {
            "User-Agent": "Gage Trade",
          }),

          Accept: "application/json",
        },
      });

      const parsedStats = response.data.result.flatMap((result) =>
        result.entries.map((entry) => {
          const transformedText = entry.text
            .replace(/\[([^\]]+)\]/g, (_match, group: string) => {
              const sortedElements = group
                .split(",")
                .map((el) => el.trim())
                .sort((a, b) => a.length - b.length);
              return `(${sortedElements.join("|")})`;
            })
            .replaceAll("+", "\\+")
            .replace("increased", "(increased|reduced)")
            .replaceAll("#", "\\+?\\d+(?:\\.\\d+)?");

          const mappedRegex = new RegExp(`^${transformedText}(s?)$`, "g");

          return {
            ...entry,
            mappedRegex,
          };
        }),
      );

      this.cachedData = parsedStats;
      console.log("ok did it!", this.cachedData.length);

      return parsedStats;
    } catch (error) {
      console.error(error);
      throw new Error("Failed to get stats info!");
    }
  }
}

export default AffixInfoFetcher;
