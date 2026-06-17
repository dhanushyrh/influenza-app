// Unified category taxonomy — creator_categories slugs (see lib/ob-data.ts, DB table).
import { CREATOR_CATEGORIES, type CreatorCategory } from "./ob-data";

export type CategorySlug = string;

/** Lookup label + emoji for a slug (falls back gracefully). */
export function categoryMeta(slug: string): { slug: string; label: string; emoji: string } {
  const hit = CREATOR_CATEGORIES.find((c) => c.slug === slug);
  if (hit) return { slug: hit.slug, label: hit.label, emoji: emojiForSlug(hit.slug) };
  // Legacy food-deck keys (cafe, street, …) → food & drink
  if (LEGACY_FOOD_KEYS.has(slug)) return { slug: "food_drink", label: "Food & Drink", emoji: "🍜" };
  return { slug, label: slug.replace(/_/g, " "), emoji: "🏷️" };
}

const LEGACY_FOOD_KEYS = new Set(["cafe", "street", "fine", "bakery", "healthy", "bar", "food", "food_drinks"]);

const SLUG_EMOJI: Record<string, string> = {
  lifestyle: "✨", beauty: "💄", fashion: "👗", travel: "✈️",
  health_fitness: "💪", food_drink: "🍜", comedy_entertainment: "🎭",
  animals_pets: "🐾", music_dance: "🎵", art_photography: "📷",
  adventure_outdoors: "🏔️", education: "📚", entrepreneur_business: "💼",
  athlete_sports: "⚽", technology: "💻", gaming: "🎮",
  healthcare: "🏥", automotive: "🚗", celebrity: "⭐",
};

function emojiForSlug(slug: string): string {
  return SLUG_EMOJI[slug] ?? "🏷️";
}

/** Normalize legacy DB/UI values to a creator_categories slug. */
export function normalizeCategorySlug(raw: string | undefined | null): CategorySlug {
  if (!raw) return "food_drink";
  if (CREATOR_CATEGORIES.some((c) => c.slug === raw)) return raw;
  if (LEGACY_FOOD_KEYS.has(raw)) return "food_drink";
  return raw;
}

/** All slugs on a creator card / profile. */
export function creatorCategorySlugs(c: { cats?: string[]; category?: string }): CategorySlug[] {
  const fromCats = (c.cats ?? []).map(normalizeCategorySlug);
  if (fromCats.length) return [...new Set(fromCats)];
  const primary = normalizeCategorySlug(c.category);
  return primary ? [primary] : [];
}

/** Discover deck: creator visible if any of their categories matches the business's single category. */
export function creatorMatchesBusinessCategory(
  creator: { cats?: string[]; category?: string },
  businessCategory: string,
): boolean {
  const biz = normalizeCategorySlug(businessCategory);
  if (!biz) return true;
  return creatorCategorySlugs(creator).includes(biz);
}

/** Briefs feed: show campaign if its category matches any of the creator's selected categories. */
export function oppMatchesCreatorCategories(
  opp: { category: string; cats?: string[] },
  creatorCats: string[],
): boolean {
  const mine = creatorCats.map(normalizeCategorySlug);
  if (!mine.length) return true;
  const oppCat = normalizeCategorySlug(opp.category);
  const oppCats = (opp.cats ?? [oppCat]).map(normalizeCategorySlug);
  return oppCats.some((c) => mine.includes(c));
}

/** Filter chips for creator briefs tab — only categories the creator selected (+ All). */
export function briefFilterCategories(creatorCats: string[]): CreatorCategory[] {
  const slugs = new Set(creatorCats.map(normalizeCategorySlug));
  return CREATOR_CATEGORIES.filter((c) => slugs.has(c.slug));
}

/** Search / filter: creator matches any selected filter category slug. */
export function creatorMatchesFilterCategories(
  creator: { cats?: string[]; category?: string },
  filterCats: string[],
): boolean {
  if (!filterCats.length) return true;
  const normalized = filterCats.map(normalizeCategorySlug);
  return creatorCategorySlugs(creator).some((c) => normalized.includes(c));
}
