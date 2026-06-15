import Link from "next/link";
import { SwipeDeck } from "@/components/SwipeDeck";
import { getDeck } from "@/lib/queries";

// Reads the cached deck via the query layer (live Supabase when configured +
// authed, else mock). Phase 2: filter by the business's city + niche and
// exclude already-swiped cards.
export default async function SwipePage() {
  const deck = await getDeck();
  return (
    <main className="flex flex-1 flex-col">
      <header className="flex items-center justify-between border-b border-neutral-100 p-4">
        <Link href="/" className="text-sm text-neutral-400">
          ← Home
        </Link>
        <h1 className="font-semibold">Discover creators</h1>
        <span className="text-xs text-neutral-400">Bengaluru · Food</span>
      </header>
      <SwipeDeck deck={deck} />
    </main>
  );
}
