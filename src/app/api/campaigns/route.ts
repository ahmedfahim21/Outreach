import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const {
            userId,
            title,
            description,
            searchIntent,
            customSearchIntent,
            targetSkills,
            selectedTools,
            totalBudgetInUSDC,
            totalBudgetInEURC,
            autoNegotiation,
            autoFollowups
        } = body;

        if (!userId || !title || !description || !searchIntent || !targetSkills?.length || !selectedTools?.length) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        const campaign = await prisma.campaign.create({
            data: {
                userId,
                title,
                description,
                searchIntent,
                customSearchIntent,
                targetSkills,
                selectedTools,
                totalBudgetInUSDC,
                totalBudgetInEURC,
                autoNegotiation: autoNegotiation || false,
                autoFollowups: autoFollowups || false,
                isPaid: false
            }
        });

        return NextResponse.json({
            success: true,
            campaignId: campaign.id,
            totalBudgetInUSDC: campaign.totalBudgetInUSDC,
            totalBudgetInEURC: campaign.totalBudgetInEURC
        });
    } catch (error) {
        console.error("Error creating campaign:", error);
        return NextResponse.json(
            { error: "Failed to create campaign" },
            { status: 500 }
        );
    }
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get("userId");

        if (!userId) {
            return NextResponse.json(
                { error: "userId is required" },
                { status: 400 }
            );
        }

        const campaigns = await prisma.campaign.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" }
        });

        return NextResponse.json(campaigns);
    } catch (error) {
        console.error("Error fetching campaigns:", error);
        return NextResponse.json(
            { error: "Failed to fetch campaigns" },
            { status: 500 }
        );
    }
}
