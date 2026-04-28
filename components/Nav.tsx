import Link from "next/link";

export function Nav() {
  return (
    <header className="bg-white border-b">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link href="/" className="text-xl font-black text-brand-dark">
          BeingBrief Review Generator
        </Link>
        <div className="flex gap-3">
          <Link href="/dashboard" className="btn-secondary">Dashboard</Link>
        </div>
      </div>
    </header>
  );
}
