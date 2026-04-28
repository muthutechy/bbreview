import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateReviews } from "@/lib/ai";

function safeFallback(input: any) {
  return {
    short: `Good experience with ${input.service}. The work was done properly.`,
    medium: `I had a good experience with ${input.businessName}. The team handled the ${input.service} work neatly and explained things clearly.`,
    casual: `Nice experience overall. The work was clean and the team was helpful.`,
    warnings: [],
  };
}

function normalizeReviews(reviews: any, body: any) {
  const fallback = safeFallback(body);

  return {
    short: reviews?.short || fallback.short,
    medium: reviews?.medium || fallback.medium,
    casual: reviews?.casual || fallback.casual,
    warnings: [],
  };
}

export async function POST(req: Request) {
  const body = await req.json();

  const business = await prisma.business.findUnique({
    where: { id: body.businessId },
    include: { services: true, locations: true },
  });

  if (!business) return NextResponse.json({ error: "Business not found" }, { status: 404 });

  let aiReviews: any;

  try {
    aiReviews = await generateReviews({
      business: body.businessName,
      service: body.service,
      location: body.location,
      rating: body.rating,
      experiencePoints: body.experiencePoints || [],
      language: body.language,
      tone: body.tone,
      length: body.length,
    });
  } catch (error) {
    console.log("AI review generation failed. Using fallback flow:", error);
    aiReviews = safeFallback(body);
  }

  const reviews = normalizeReviews(aiReviews, body);

  const session = await prisma.reviewSession.create({
    data: {
      businessId: body.businessId,
      service: body.service,
      location: body.location,
      rating: body.rating,
      language: body.language,
      tone: body.tone,
      length: body.length,
      experiencePoints: body.experiencePoints || [],
      generatedReviews: reviews,
      staff: body.staff || null,
    },
  });

  await prisma.analytics.create({
    data: {
      businessId: body.businessId,
      actionType: "review_generated",
      metadata: { sessionId: session.id, staff: body.staff || null }
    }
  });

  return NextResponse.json({ reviews, sessionId: session.id });
}
