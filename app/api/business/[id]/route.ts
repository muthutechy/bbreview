import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import slugify from "slugify";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

async function getOwnedBusiness(id: string, ownerId: string) {
  return prisma.business.findFirst({
    where: { id, ownerId },
    include: { services: true, locations: true },
  });
}

async function uniqueSlug(name: string, currentBusinessId: string) {
  const slugBase = slugify(name, { lower: true, strict: true });
  let slug = slugBase || currentBusinessId;
  let count = 1;

  while (true) {
    const existing = await prisma.business.findUnique({ where: { slug } });
    if (!existing || existing.id === currentBusinessId) return slug;
    slug = `${slugBase}-${count++}`;
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const ownerId = (session.user as any).id;
  const existing = await getOwnedBusiness(id, ownerId);

  if (!existing) return NextResponse.json({ error: "Business not found" }, { status: 404 });

  const body = await req.json();
  const slug = await uniqueSlug(body.name, id);

  const business = await prisma.$transaction(async (tx) => {
    await tx.service.deleteMany({ where: { businessId: id } });
    await tx.location.deleteMany({ where: { businessId: id } });

    return tx.business.update({
      where: { id },
      data: {
        name: body.name,
        slug,
        category: body.category,
        address: body.address,
        city: body.city,
        phone: body.phone,
        website: body.website || null,
        reviewLink: body.reviewLink,
        tone: body.tone || "friendly",
        preferredLanguages: body.preferredLanguages || ["English"],
        services: { create: (body.services || []).filter(Boolean).map((name: string) => ({ name })) },
        locations: { create: (body.locations || []).filter(Boolean).map((name: string) => ({ name })) },
      },
    });
  });

  return NextResponse.json(business);
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const ownerId = (session.user as any).id;
  const existing = await getOwnedBusiness(id, ownerId);

  if (!existing) return NextResponse.json({ error: "Business not found" }, { status: 404 });

  await prisma.business.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
