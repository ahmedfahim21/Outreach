import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

interface ContactData {
    id: string;
    campaignId: string;
    name: string;
    role?: string;
    description?: string;
    ai_score?: number;
    ai_strengths?: string[];
    ai_concerns?: string[];
    ai_reasoning?: string;
    contacted?: boolean;
    responded?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { campaignId, contacts }: { campaignId: string; contacts: ContactData[] } = body;

        if (!campaignId || !contacts || !Array.isArray(contacts)) {
            return NextResponse.json(
                { error: "Campaign ID and contacts array are required" },
                { status: 400 }
            );
        }

        // Save contacts to database
        const savedContacts = await Promise.all(
            contacts.map((contact: ContactData) =>
                prisma.contact.create({
                    data: {
                        campaignId,
                        name: contact.name || 'Unknown',
                        role: contact.role || 'Unknown',
                        description: contact.description || '',
                        ai_score: contact.ai_score || 0,
                        ai_strengths: contact.ai_strengths || [],
                        ai_concerns: contact.ai_concerns || [],
                        ai_reasoning: contact.ai_reasoning || ''
                    }
                })
            )
        );

        return NextResponse.json({
            success: true,
            contacts: savedContacts,
            count: savedContacts.length
        });
    } catch (error) {
        console.error("Error saving contacts:", error);
        return NextResponse.json(
            { error: "Failed to save contacts" },
            { status: 500 }
        );
    }
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const campaignId = searchParams.get('campaignId');

        if (!campaignId) {
            return NextResponse.json(
                { error: "Campaign ID is required" },
                { status: 400 }
            );
        }

        const contacts = await prisma.contact.findMany({
            where: {
                campaignId
            },
            orderBy: {
                ai_score: 'desc'
            }
        });

        return NextResponse.json({ contacts });
    } catch (error) {
        console.error("Error fetching contacts:", error);
        return NextResponse.json(
            { error: "Failed to fetch contacts" },
            { status: 500 }
        );
    }
}
