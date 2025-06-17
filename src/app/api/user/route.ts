import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {

    const { searchParams } = request.nextUrl;
    const data = await prisma.user.findFirst({
        where: {
            walletAddress:  searchParams.get("walletAddress") || undefined,
        },
    });

    return new NextResponse(JSON.stringify(data), {
        status: 200,
        headers: {
            "Content-Type": "application/json",
        },
    });
}