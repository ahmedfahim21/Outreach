import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id: campaignId } = await params;
    const body = await request.json();
    const { isPaid, paymentAmount, paymentToken } = body;

    if (!campaignId) {
      return NextResponse.json(
        { error: "Campaign ID is required" },
        { status: 400 }
      );
    }

    // Update campaign payment status
    const updatedCampaign = await prisma.campaign.update({
      where: {
        id: campaignId
      },
      data: {
        isPaid: isPaid || false,
        paymentAmount,
        paymentToken,
        updatedAt: new Date()
      }
    });

    return NextResponse.json({ 
      success: true, 
      campaign: updatedCampaign
    });
  } catch (error) {
    console.error("Error updating campaign:", error);
    return NextResponse.json(
      { error: "Failed to update campaign" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id: campaignId } = await params;

    if (!campaignId) {
      return NextResponse.json(
        { error: "Campaign ID is required" },
        { status: 400 }
      );
    }

    const campaign = await prisma.campaign.findUnique({
      where: {
        id: campaignId
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            contactEmail: true,
            walletAddress: true
          }
        }
      }
    });

    if (!campaign) {
      return NextResponse.json(
        { error: "Campaign not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ campaign });
  } catch (error) {
    console.error("Error fetching campaign:", error);
    return NextResponse.json(
      { error: "Failed to fetch campaign" },
      { status: 500 }
    );
  }
}
