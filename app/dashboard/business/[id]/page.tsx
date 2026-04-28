import { prisma } from "@/lib/prisma";
import QRCode from "qrcode";
import Link from "next/link";

export default async function BusinessDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const business = await prisma.business.findUnique({
    where: { id },
    include: { services: true, locations: true, analytics: true },
  });

  if (!business) return <main className="p-10">Business not found</main>;

  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
  const reviewPage = `${baseUrl}/r/${business.slug}`;
  const qr = await QRCode.toDataURL(reviewPage);
  const waMessage = `Hi 😊 Please share your real experience with ${business.name}. Click this link to write your review easily: ${reviewPage}`;

  const analyticsCount = (type: string) => business.analytics.filter(a => a.actionType === type).length;

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link href="/dashboard" className="text-brand-blue font-semibold">← Back</Link>
        <Link href={`/dashboard/business/${business.id}/edit`} className="btn-primary">Edit Business</Link>
      </div>

      <h1 className="mt-4 text-3xl font-black">{business.name}</h1>
      <p className="text-gray-600">{business.category} • {business.city}</p>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <div className="card">
          <h2 className="text-xl font-bold">Business Details</h2>
          <div className="mt-4 space-y-2 text-sm">
            <p><b>Address:</b> {business.address}</p>
            <p><b>Phone:</b> {business.phone}</p>
            {business.website && <p><b>Website:</b> <a href={business.website} target="_blank" className="text-brand-blue">{business.website}</a></p>}
            <p><b>Google Review Link:</b> <span className="break-all text-brand-blue">{business.reviewLink}</span></p>
          </div>
        </div>

        <div className="card">
          <h2 className="text-xl font-bold">Customer Review Link</h2>
          <p className="mt-3 break-all text-brand-blue">{reviewPage}</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <a className="btn-primary" href={reviewPage} target="_blank">Open Link</a>
            <a className="btn-secondary" href={`https://wa.me/?text=${encodeURIComponent(waMessage)}`} target="_blank">Share on WhatsApp</a>
          </div>
        </div>

        <div className="card">
          <h2 className="text-xl font-bold">QR Code</h2>
          <img src={qr} alt="QR Code" className="mt-4 h-48 w-48 rounded-xl border" />
        </div>

        <div className="card">
          <h2 className="text-xl font-bold">Services & Locations</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div>
              <p className="font-bold">Services</p>
              <ul className="mt-2 list-disc pl-5 text-sm text-gray-700">
                {business.services.map((s) => <li key={s.id}>{s.name}</li>)}
              </ul>
            </div>
            <div>
              <p className="font-bold">Locations</p>
              <ul className="mt-2 list-disc pl-5 text-sm text-gray-700">
                {business.locations.map((l) => <li key={l.id}>{l.name}</li>)}
              </ul>
            </div>
          </div>
        </div>

        <div className="card">
          <h2 className="text-xl font-bold">Analytics</h2>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-brand-light p-4"><b>{analyticsCount("link_open")}</b><br />Link Opens</div>
            <div className="rounded-xl bg-brand-light p-4"><b>{analyticsCount("review_generated")}</b><br />Generated</div>
            <div className="rounded-xl bg-brand-light p-4"><b>{analyticsCount("copy_review")}</b><br />Copied</div>
            <div className="rounded-xl bg-brand-light p-4"><b>{analyticsCount("google_link_click")}</b><br />Google Clicks</div>
          </div>
        </div>

        <div className="card">
          <h2 className="text-xl font-bold">AI Analysis</h2>
          <pre className="mt-3 overflow-auto rounded-xl bg-gray-50 p-4 text-xs">
            {JSON.stringify(business.aiAnalysis, null, 2)}
          </pre>
        </div>
      </div>
    </main>
  );
}
