import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {

    const body = await request.json();
    const data = await prisma.user.create({
        data: {
            companyName: body.companyName,
            purpose: body.purpose,
            contactEmail: body.contactEmail,
            website: body.website || null,
            walletAddress: body.walletAddress || "",
        },
    });

    return new NextResponse(JSON.stringify(data), {
        status: 201,
        headers: {
            "Content-Type": "application/json",
        },
    });
}