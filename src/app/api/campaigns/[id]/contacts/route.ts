import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  request: NextRequest, 
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: campaignId } = await params;

    if (!campaignId) {
      return NextResponse.json(
        { error: "Campaign ID is required" },
        { status: 400 }
      );
    }

    const contacts = await prisma.contact.findMany({
      where: {
        campaignId: campaignId
      },
      orderBy: {
        ai_score: 'desc'
      }
    });

    return NextResponse.json({
      success: true,
      contacts,
      count: contacts.length
    });
  } catch (error) {
    console.error("Error fetching campaign contacts:", error);
    return NextResponse.json(
      { error: "Failed to fetch contacts" },
      { status: 500 }
    );
  }
}
