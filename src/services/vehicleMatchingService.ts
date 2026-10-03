// All comments in code are in English as per project rules

export interface CatalogItem {
  id?: string;
  title?: string;
  categoryPath?: string;
  notes?: string;
  [key: string]: any;
}

// Multilingual keyword dictionary (EN, NO, RU) for vehicle maintenance parts
const SERVICE_KEYWORDS: Record<
  string,
  { include: string[]; exclude: string[] }
> = {
  oil_filter: {
    include: [
      // English
      "oil",
      "motor oil",
      "engine oil",
      "5w30",
      "0w30",
      "5w-30",
      "0w-30",
      "oil filter",
      // Norwegian
      "olje",
      "motorolje",
      "oljefilter",
      // Russian
      "масло",
      "моторное масло",
      "масляный фильтр",
      "5в30",
      "0в30",
    ],
    exclude: ["gear", "transmission", "гэры", "трансмиссионное"],
  },
  air_filter: {
    include: [
      // English
      "air filter",
      "engine air",
      // Norwegian
      "luftfilter",
      // Russian
      "воздушный фильтр",
      "фильтр воздушный",
    ],
    exclude: ["cabin", "kupe", "салонный"],
  },
  cabin_filter: {
    include: [
      // English
      "cabin filter",
      "pollen filter",
      "cabin",
      // Norwegian
      "kupefilter",
      "pollenfilter",
      // Russian
      "салонный фильтр",
      "пылевой фильтр",
      "угольный фильтр",
    ],
    exclude: [],
  },
  fuel_filter: {
    include: [
      // English
      "fuel filter",
      "diesel filter",
      // Norwegian
      "drivstoffilter",
      "dieselfilter",
      // Russian
      "топливный фильтр",
      "дизельный фильтр",
    ],
    exclude: [
      "tilsetning",
      "additive",
      "speed tec",
      "cleaner",
      "присадка",
      "очиститель",
    ],
  },
  timing_belt: {
    include: [
      // English
      "timing belt",
      "water pump",
      "cambelt",
      "belt kit",
      // Norwegian
      "registerreim",
      "vannpumpe",
      "regreim",
      // Russian
      "ремень грм",
      "комплект грм",
      "водяная помпа",
      "помпа",
    ],
    exclude: [],
  },
  eu_kontroll: {
    include: [
      // English
      "inspection",
      "eu-control",
      "periodic",
      // Norwegian
      "eu-kontroll",
      "periodisk",
      "kontroll",
      // Russian
      "техосмотр",
      "еу-контроль",
      "контроль",
    ],
    exclude: [],
  },
};

// Finds the best matching catalog item for a given service rule across EN, NO, and RU languages
export const findBestMatchingCatalogItem = (
  ruleId: string,
  catalogItems: CatalogItem[],
): CatalogItem | null => {
  const ruleConfig = SERVICE_KEYWORDS[ruleId];
  if (!ruleConfig) return null;
  if (ruleId === "eu_kontroll") {
    return { isInspection: true }; // Special flag so UI knows it's an inspection, not a spare part
  }

  // First try: strict match (must include at least one 'include' keyword and NO 'exclude' keywords)
  const strictMatch = catalogItems.find((item) => {
    const text =
      `${item.title || ""} ${item.categoryPath || ""} ${item.notes || ""}`.toLowerCase();

    const hasInclude = ruleConfig.include.some((kw) =>
      text.includes(kw.toLowerCase()),
    );
    const hasExclude = ruleConfig.exclude.some((kw) =>
      text.includes(kw.toLowerCase()),
    );

    return hasInclude && !hasExclude;
  });

  if (strictMatch) return strictMatch;

  return null;
};
