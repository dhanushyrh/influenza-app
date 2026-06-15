export const CITIES = [
  "Bengaluru", "Mumbai", "Delhi NCR", "Hyderabad", "Chennai", "Pune", "Kolkata", "Ahmedabad",
];

export interface CreatorCategory {
  slug: string;
  label: string;
}

// Static fallback — DB table creator_categories is the source of truth
export const CREATOR_CATEGORIES: CreatorCategory[] = [
  { slug: "lifestyle",             label: "Lifestyle" },
  { slug: "beauty",                label: "Beauty" },
  { slug: "fashion",               label: "Fashion" },
  { slug: "travel",                label: "Travel" },
  { slug: "health_fitness",        label: "Health & Fitness" },
  { slug: "food_drink",            label: "Food & Drink" },
  { slug: "comedy_entertainment",  label: "Comedy & Entertainment" },
  { slug: "animals_pets",          label: "Animals & Pets" },
  { slug: "music_dance",           label: "Music & Dance" },
  { slug: "art_photography",       label: "Art & Photography" },
  { slug: "adventure_outdoors",    label: "Adventure & Outdoors" },
  { slug: "education",             label: "Education" },
  { slug: "entrepreneur_business", label: "Entrepreneur & Business" },
  { slug: "athlete_sports",        label: "Athlete & Sports" },
  { slug: "technology",            label: "Technology / Tech" },
  { slug: "gaming",                label: "Gaming" },
  { slug: "healthcare",            label: "Healthcare" },
  { slug: "automotive",            label: "Automotive" },
  { slug: "celebrity",             label: "Celebrity & Public Figure" },
];

export interface Category {
  key: string;
  label: string;
  emoji: string;
  subs: string[];
}

export const CATEGORIES: Category[] = [
  { key: "food_drinks", label: "Food & Drinks", emoji: "🍜", subs: ["Café", "Street food", "Fine dining", "Bakery & desserts", "Bar & nightlife", "Cloud kitchen"] },
  { key: "service",     label: "Services",      emoji: "💈", subs: ["Salon & spa", "Fitness", "Wellness", "Home services", "Auto & detailing"] },
  { key: "product",     label: "Products",       emoji: "🛍️", subs: ["Fashion", "Beauty", "Gadgets & tech", "Home & decor", "Handmade"] },
];

export interface ServiceCatalogItem {
  code: string;
  title: string;
  emoji: string;
  suggested: number;
  blurb: string;
}

export const SERVICE_CATALOG: ServiceCatalogItem[] = [
  { code: "reel",  title: "Instagram Reel", emoji: "🎬", suggested: 6000, blurb: "15–60s vertical video" },
  { code: "post",  title: "Feed Post",       emoji: "📷", suggested: 3000, blurb: "Single image or carousel" },
  { code: "story", title: "Story",           emoji: "✨", suggested: 1500, blurb: "Up to 3 frames, 24h" },
];
