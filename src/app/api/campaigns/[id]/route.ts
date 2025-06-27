import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PATCH(request: NextRequest, { params }: {params: Promise<{ id: string }> }) {
  try {
    const { id: campaignId } = await params;
    const body = await request.json();
    const { isPaid, paymentAmount, paymentToken, status } = body;

    if (!campaignId) {
      return NextResponse.json(
        { error: "Campaign ID is required" },
        { status: 400 }
      );
    }

    const updateData: {
      updatedAt: Date;
      isPaid?: boolean;
      paymentAmount?: string;
      paymentToken?: string;
      status?: string;
    } = {
      updatedAt: new Date()
    };

    if (isPaid !== undefined) updateData.isPaid = isPaid;
    if (paymentAmount !== undefined) updateData.paymentAmount = paymentAmount;
    if (paymentToken !== undefined) updateData.paymentToken = paymentToken;
    if (status !== undefined) updateData.status = status;

    const updatedCampaign = await prisma.campaign.update({
      where: {
        id: campaignId
      },
      data: updateData
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

export async function GET(request: NextRequest, { params }: {params: Promise<{ id: string }>}) {
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
