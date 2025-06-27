import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = request.nextUrl;
        const walletAddress = searchParams.get("walletAddress");
        
        if (!walletAddress) {
            return new NextResponse(JSON.stringify({ error: "Wallet address is required" }), {
                status: 400,
                headers: { "Content-Type": "application/json" },
            });
        }
        
        const data = await prisma.user.findFirst({
            where: { walletAddress },
            include: {
                googleAccount: {
                    select: {
                        id: true,
                        email: true,
                        createdAt: true
                    }
                }
            }
        });
        
        if (!data) {
            return new NextResponse(JSON.stringify({ message: "User not found" }), {
                status: 404,
                headers: { "Content-Type": "application/json" },
            });
        }
        
        return new NextResponse(JSON.stringify(data), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    } catch (error) {
        console.error("Error fetching user:", error);
        return new NextResponse(JSON.stringify({ error: "Internal server error" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
}