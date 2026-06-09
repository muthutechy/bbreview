import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { BusinessEditForm } from "@/components/BusinessEditForm";

export default async function EditBusinessPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const { id } = await params;
  const ownerId = (session.user as any).id;

  // FIX: Only allow editing if the business belongs to this user
  const business = await prisma.business.findFirst({
    where: { id, ownerId },
    include: { services: true, locations: true },
  });

  if (!business) return (
    <main className="p-10">
      <p className="text-gray-600">Business not found or you don&apos;t have access to it.</p>
      <Link href="/dashboard" className="mt-4 inline-block text-brand-blue font-semibold">← Back to Dashboard</Link>
    </main>
  );

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <Link href={`/dashboard/business/${business.id}`} className="text-brand-blue font-semibold">← Back to Business</Link>
      <h1 className="mb-6 mt-4 text-3xl font-black">Edit Business</h1>
      <BusinessEditForm business={business} />
    </main>
  );
}
