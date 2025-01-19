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
          const baseText = entry.text.endsWith("s")
            ? entry.text.slice(0, -1)
            : entry.text;

          const transformedText = baseText
            .replace(/\[([^\]]+)\]/g, (_match, group: string) => {
              const sortedElements = group
                .split(",")
                .map((el) => el.trim())
                .sort((a, b) => a.length - b.length);
              return `(${sortedElements.join("|")})`;
            })
            .replaceAll("+", "\\+")
            .replaceAll("increased number of", "increased")
            .replaceAll("increased", "(increased|reduced)")

            .replaceAll("#", "(?:an|\\+?\\d+(?:\\.\\d+)?)")
            // Next are specific to precursors
            .replaceAll(
              "Areas which contain",
              "(Areas which contain|Your Maps which contain)",
            )
            .replaceAll("in Area", "(in your Maps|in Area)")
            .replaceAll("in this Area", "(in your Maps|in this Area)")
            // Radiu on purpose since 's' gets cut off, probably rethink how to solve the appendage some other way
            .replaceAll("Explosive Radiu", "Explosive Radius( in your Maps)?");

          const mappedRegex = new RegExp(
            `^${transformedText}(s?)( in your Maps)?$`,
            "g",
          );

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
