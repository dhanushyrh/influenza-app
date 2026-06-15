export const T = {
  bg: "#faf8f6",
  card: "#ffffff",
  line: "#efe7e3",
  lineSoft: "#f5efec",
  ink: "#1f1110",
  ink2: "#5a4a47",
  ink3: "#9a8a86",
  rose: "#ff4d6d",
  roseDark: "#c9184a",
  roseTint: "rgba(255,77,109,0.10)",
  roseTint2: "rgba(255,77,109,0.18)",
  mint: "#138a5e",
  mintInk: "#0c6e4a",
  mintTint: "rgba(19,138,94,0.10)",
  mintTint2: "rgba(19,138,94,0.16)",
  amber: "#9a6a04",
  amberTint: "#fdf3d6",
  display: "var(--font-space), system-ui, sans-serif",
  body: "-apple-system, system-ui, 'Segoe UI', sans-serif",
} as const;

export const inr = (n: number) => "₹" + Number(n).toLocaleString("en-IN");
export const kfmt = (n: number) =>
  n >= 1000 ? (n / 1000).toFixed(n % 1000 === 0 ? 0 : 1) + "k" : String(n);
