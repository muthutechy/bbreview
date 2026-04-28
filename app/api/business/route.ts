import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import slugify from "slugify";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { analyzeBusiness } from "@/lib/ai";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();

  const slugBase = slugify(body.name, { lower: true, strict: true });
  let slug = slugBase;
  let count = 1;

  while (await prisma.business.findUnique({ where: { slug } })) {
    slug = `${slugBase}-${count++}`;
  }

  const analysis = await analyzeBusiness({
    name: body.name,
    category: body.category,
    city: body.city,
    services: body.services || [],
    locations: body.locations || [],
  });

  const business = await prisma.business.create({
    data: {
      ownerId: (session.user as any).id,
      name: body.name,
      slug,
      category: body.category,
      address: body.address,
      city: body.city,
      phone: body.phone,
      website: body.website,
      reviewLink: body.reviewLink,
      tone: body.tone || "friendly",
      preferredLanguages: body.preferredLanguages || ["English"],
      aiAnalysis: analysis,
      services: { create: (body.services || []).map((name: string) => ({ name })) },
      locations: { create: (body.locations || []).map((name: string) => ({ name })) },
    },
  });

  return NextResponse.json(business);
}
