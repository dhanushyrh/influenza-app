import Link from "next/link";
import { getBusinessById } from "@/lib/queries";
import { formatCount } from "@/lib/metrics";
import { HiringBadge } from "@/components/HiringBadge";

export default async function BusinessPage({ params }: { params: { id: string } }) {
  const b = await getBusinessById(params.id);

  return (
    <main className="flex flex-1 flex-col">
      <header className="flex items-center gap-3 border-b border-neutral-100 p-4">
        <Link href="/" className="text-sm text-neutral-400">
          ← Home
        </Link>
        <h1 className="font-semibold">Business profile</h1>
      </header>

      <section className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-neutral-100 text-2xl">
              ☕
            </div>
            <div>
              <h2 className="text-lg font-bold leading-tight">{b.name}</h2>
              <p className="text-sm text-neutral-500">{b.handle}</p>
              <p className="text-xs text-neutral-400">
                {formatCount(b.stats.followers)} followers · {b.location.city} ·{" "}
                {b.stats.engagementRate}% eng.
              </p>
            </div>
          </div>
          <HiringBadge status={b.hiringStatus} />
        </div>
        <p className="mt-3 text-sm text-neutral-600">{b.bio}</p>
      </section>

      <section className="px-4">
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-400">
          Vibe check · last 6 posts
        </h3>
        <div className="grid grid-cols-3 gap-1">
          {b.posts.map((p) => (
            <div
              key={p.id}
              className="flex aspect-square items-center justify-center rounded-lg bg-neutral-100 text-neutral-300"
            >
              ▦
            </div>
          ))}
        </div>
      </section>

      <section className="p-4">
        <div className="rounded-2xl border border-neutral-200 p-4 text-sm">
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-400">
            Target audience
          </h3>
          <p className="text-neutral-600">
            Ages {b.target.ageMin}–{b.target.ageMax} · {b.target.gender} · {b.target.area}
          </p>
          {b.pitchText && (
            <p className="mt-3 rounded-xl bg-brand/5 p-3 text-neutral-700">
              “{b.pitchText}”
            </p>
          )}
        </div>
      </section>
    </main>
  );
}
