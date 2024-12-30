export type ItemStat = {
  type: string;
  value: number;
  included?: boolean;
};

export type AffixInfo = {
  poe_id: string;
  regex: RegExp;
  type: "EXPLICIT" | "IMPLICIT" | "ENCHANT";
  rawText?: string;
};

type Searchable = { included: boolean };
type Rollable = { roll: number | undefined };
export type RollableSearchableAffix = { affix: AffixInfo[] } & Rollable &
  Searchable;

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
  implicit?: RollableSearchableAffix[];
  affixs?: RollableSearchableAffix[];
  enchant?: RollableSearchableAffix[];
};

type SearchableValue<T> = {
  value: T;
  included: boolean;
};

export type SearchableArray<T> = {
  value: T[];
};

// The main mapped type
export type SearchableItemData = {
  [K in keyof ParsedItemData]: ParsedItemData[K] extends (infer U)[]
    ? SearchableArray<U>
    : SearchableValue<NonNullable<ParsedItemData[K]>>;
};
