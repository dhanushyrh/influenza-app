import { isInstagramConfigured } from "@/lib/instagram";
import { WelcomeScreen } from "@/components/WelcomeScreen";

export default function Home() {
  return <WelcomeScreen igConfigured={isInstagramConfigured} />;
}
