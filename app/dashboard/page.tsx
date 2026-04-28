import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const businesses = await prisma.business.findMany({
    where: { ownerId: (session.user as any).id },
    include: { services: true, locations: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black">Dashboard</h1>
          <p className="text-gray-600">Manage review generator links.</p>
        </div>
        <Link href="/dashboard/business/new" className="btn-primary">Add Business</Link>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        {businesses.map((b) => (
          <Link href={`/dashboard/business/${b.id}`} key={b.id} className="card hover:shadow-md">
            <h2 className="text-xl font-bold">{b.name}</h2>
            <p className="text-gray-600">{b.category} • {b.city}</p>
            <p className="mt-3 text-sm text-brand-blue">/r/{b.slug}</p>
          </Link>
        ))}
      </div>

      {businesses.length === 0 && (
        <div className="card">
          <p>No business added yet.</p>
        </div>
      )}
    </main>
  );
}
