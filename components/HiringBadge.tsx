import { HiringStatus } from "@/lib/types";

const MAP: Record<HiringStatus, { label: string; cls: string }> = {
  actively_looking: { label: "Actively looking", cls: "bg-green-100 text-green-700" },
  looking_out: { label: "Looking out", cls: "bg-amber-100 text-amber-700" },
  not_looking: { label: "Not looking", cls: "bg-neutral-100 text-neutral-500" },
};

export function HiringBadge({ status }: { status: HiringStatus }) {
  const { label, cls } = MAP[status];
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${cls}`}>
      {label}
    </span>
  );
}
