import { prisma } from "@/lib/prisma";
import { ReviewGenerator } from "@/components/ReviewGenerator";

export default async function PublicReviewPage({
  params,
  searchParams
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ staff?: string; service?: string }>;
}) {
  const { slug } = await params;
  const sp = await searchParams;

  const business = await prisma.business.findUnique({
    where: { slug },
    include: { services: true, locations: true },
  });

  if (!business) return <main className="p-10">Business not found</main>;

  await prisma.analytics.create({
    data: {
      businessId: business.id,
      actionType: "link_open",
      metadata: { staff: sp.staff || null, service: sp.service || null }
    }
  });

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-black">{business.name}</h1>
        <p className="mt-2 text-gray-600">Write your real experience easily.</p>
      </div>
      <ReviewGenerator
        business={{
          id: business.id,
          name: business.name,
          reviewLink: business.reviewLink,
          services: business.services.map(s => s.name),
          locations: business.locations.map(l => l.name),
          defaultService: sp.service || "",
          staff: sp.staff || ""
        }}
      />
    </main>
  );
}
