import { T } from "@/lib/ob-tokens";
import { Spinner } from "@/components/ob-primitives";

// Full-screen branded loader used as the Suspense fallback for server-rendered
// routes (loading.tsx). Prevents the "frozen app" feeling in the PWA while the
// server fetches data during navigation.
export function ScreenLoader({ label }: { label?: string }) {
  return (
    <div style={{
      height: "100svh", maxWidth: 480, margin: "0 auto",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      gap: 14, background: T.bg,
    }}>
      <Spinner size={32} />
      {label && (
        <p style={{ margin: 0, fontFamily: T.body, fontSize: 13.5, color: T.ink3 }}>{label}</p>
      )}
    </div>
  );
}
