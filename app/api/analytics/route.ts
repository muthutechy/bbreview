import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const body = await req.json();

  if (!body.businessId || !body.actionType) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  await prisma.analytics.create({
    data: {
      businessId: body.businessId,
      actionType: body.actionType,
      metadata: { sessionId: body.sessionId || null }
    }
  });

  if (body.sessionId && body.actionType === "copy_review") {
    await prisma.reviewSession.update({
      where: { id: body.sessionId },
      data: { copied: true }
    }).catch(() => null);
  }

  if (body.sessionId && body.actionType === "google_link_click") {
    await prisma.reviewSession.update({
      where: { id: body.sessionId },
      data: { googleLinkClicked: true }
    }).catch(() => null);
  }

  return NextResponse.json({ success: true });
}
