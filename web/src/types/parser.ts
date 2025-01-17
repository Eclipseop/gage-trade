// Base types for immutable parsed data
export type ItemStat = {
  type: string;
  value: number;
};

export type AffixInfo = {
  poe_id: string;
  regex: RegExp;
  type: "EXPLICIT" | "IMPLICIT" | "ENCHANT";
  rawText?: string;
};

export type ParsedAffix = {
  affix: AffixInfo[];
  roll?: number;
};

// Core parsed item data
export type ParsedItemData = {
  name: string;
  rarity?: string;
  itemClass: string;
  base?: string;
  quality?: number;
  areaLevel?: number;
  itemLevel?: number;
  waystoneTier?: number;
  numRuneSockets?: number;
  stats?: ItemStat[];
  implicit?: ParsedAffix[];
  affixs?: ParsedAffix[];
  enchant?: ParsedAffix[];
};

// Search-specific types
type RollRange = {
  min?: number;
  max?: number;
};

export type SearchableAffix = ParsedAffix & {
  included: boolean;
  range: RollRange;
};

export type SearchableStat = ItemStat & {
  included: boolean;
  range: RollRange;
};

type SearchableValue<T> = {
  value: T;
  included: boolean;
  // biome-ignore lint/complexity/noBannedTypes: <explanation>
} & (T extends number ? { range: RollRange } : {});

export type SearchableItemData = {
  name: SearchableValue<string>;
  rarity: SearchableValue<string>;
  itemClass: SearchableValue<string>;
  base?: SearchableValue<string>;
  quality?: SearchableValue<number>;
  areaLevel?: SearchableValue<number>;
  itemLevel?: SearchableValue<number>;
  waystoneTier?: SearchableValue<number>;
  numRuneSockets?: SearchableValue<number>;
  stats?: {
    value: SearchableStat[];
    included: boolean;
  };
  implicit?: {
    value: SearchableAffix[];
    included: boolean;
  };
  affixs?: {
    value: SearchableAffix[];
    included: boolean;
  };
  enchant?: {
    value: SearchableAffix[];
    included: boolean;
  };
};

export function makeSearchable(parsed: ParsedItemData): SearchableItemData {
  const searchable: SearchableItemData = {
    name: { value: parsed.name, included: false },
    rarity: { value: parsed.rarity || "", included: false },
    itemClass: { value: parsed.itemClass, included: false },
  };

  if (parsed.base) {
    searchable.base = { value: parsed.base, included: false };
  }

  if (parsed.quality !== undefined) {
    searchable.quality = {
      value: parsed.quality,
      included: false,
      range: { min: parsed.quality },
    };
  }

  if (parsed.areaLevel !== undefined) {
    searchable.areaLevel = {
      value: parsed.areaLevel,
      included: false,
      range: { min: parsed.areaLevel },
    };
  }

  if (parsed.itemLevel !== undefined) {
    searchable.itemLevel = {
      value: parsed.itemLevel,
      included: false,
      range: { min: parsed.itemLevel },
    };
  }

  if (parsed.waystoneTier !== undefined) {
    searchable.waystoneTier = {
      value: parsed.waystoneTier,
      included: false,
      range: { min: parsed.waystoneTier },
    };
  }

  if (parsed.numRuneSockets !== undefined) {
    searchable.numRuneSockets = {
      value: parsed.numRuneSockets,
      included: false,
      range: { min: parsed.numRuneSockets },
    };
  }

  if (parsed.stats) {
    searchable.stats = {
      value: parsed.stats.map((stat) => ({
        ...stat,
        included: false,
        range: { min: stat.value },
      })),
      included: false,
    };
  }

  if (parsed.implicit) {
    searchable.implicit = {
      value: parsed.implicit.map((affix) => ({
        ...affix,
        included: false,
        range: affix.roll ? { min: affix.roll } : {},
      })),
      included: false,
    };
  }

  if (parsed.affixs) {
    searchable.affixs = {
      value: parsed.affixs.map((affix) => ({
        ...affix,
        included: false,
        range: affix.roll ? { min: affix.roll } : {},
      })),
      included: false,
    };
  }

  if (parsed.enchant) {
    searchable.enchant = {
      value: parsed.enchant.map((affix) => ({
        ...affix,
        included: false,
        range: affix.roll ? { min: affix.roll } : {},
      })),
      included: false,
    };
  }

  return searchable;
}
