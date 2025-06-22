import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const data = await prisma.user.create({
            data: {
                name: body.name,
                contactEmail: body.contactEmail,
                walletAddress: body.walletAddress || "",
            },
        });

        return new NextResponse(JSON.stringify(data), {
            status: 201,
            headers: {
                "Content-Type": "application/json",
            },
        });
    } catch (error) {
        console.error("Error creating user:", error);
        return new NextResponse(JSON.stringify({ error: "Failed to create user" }), {
            status: 500,
            headers: {
                "Content-Type": "application/json",
            },
        });
    }
}