import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { campaignId } = body;

    if (!campaignId) {
      return NextResponse.json(
        { error: "Campaign ID is required" },
        { status: 400 }
      );
    }
    console.log("Starting AI session for campaignId:", campaignId);
    const response = await fetch(`${process.env.NEXT_PUBLIC_PYTHON_AI_URL}/start_session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to start AI session');
    }

    const result = await response.json();
    
    return NextResponse.json({ 
      success: true, 
      sessionId: result.session_id,
      message: result.message
    });
  } catch (error) {
    console.error("Error starting AI session:", error);
    return NextResponse.json(
      { error: "Failed to start AI session" },
      { status: 500 }
    );
  }
}
