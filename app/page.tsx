import Link from "next/link";
import { Nav } from "@/components/Nav";

export default function HomePage() {
  return (
    <>
      <Nav />
      <main className="mx-auto max-w-6xl px-4 py-16">
        <section className="grid gap-8 md:grid-cols-2 md:items-center">
          <div>
            <p className="mb-3 font-semibold text-brand-orange">Ethical AI Review Assistance</p>
            <h1 className="text-4xl font-black leading-tight md:text-6xl">
              Help real customers write better Google reviews.
            </h1>
            <p className="mt-5 text-lg text-gray-600">
              Create business-specific review links, QR codes, WhatsApp messages, and AI-assisted review options without auto-posting or fake reviews.
            </p>
            <div className="mt-8 flex gap-4">
              <Link href="/login" className="btn-primary">Start Now</Link>
              <Link href="/dashboard" className="btn-secondary">Open Dashboard</Link>
            </div>
          </div>
          <div className="card">
            <h2 className="text-2xl font-bold">Safe Flow</h2>
            <ol className="mt-4 space-y-3 text-gray-700">
              <li>1. Business creates review link</li>
              <li>2. Customer selects real experience</li>
              <li>3. AI suggests 3 natural options</li>
              <li>4. Customer edits and copies</li>
              <li>5. Customer posts manually on Google</li>
            </ol>
          </div>
        </section>
      </main>
    </>
  );
}
