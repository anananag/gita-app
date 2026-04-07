import { Loader2, Flower2 } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background text-[var(--color-gold)]">
      <Flower2 className="w-12 h-12 mb-4 animate-pulse" />
      <Loader2 className="w-6 h-6 animate-spin" />
      <p className="mt-4 font-heading tracking-widest uppercase text-sm">Entering the Archive...</p>
    </div>
  );
}
