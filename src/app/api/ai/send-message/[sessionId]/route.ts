import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest, { params }: { params: Promise<{ sessionId: string }> }) {
  try {
    const { sessionId } = await params;
    const body = await request.json();
    const { message } = body;

    if (!sessionId) {
      return NextResponse.json(
        { error: "Session ID is required" },
        { status: 400 }
      );
    }

    // Send message to Python AI app
    const response = await fetch(`${process.env.NEXT_PUBLIC_PYTHON_AI_URL || 'http://localhost:5050'}/send_message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        session_id: sessionId,
        message 
      })
    });

    if (!response.ok) {
      throw new Error('Failed to send message to AI');
    }

    const result = await response.json();
    
    return NextResponse.json({ 
      success: true, 
      status: result.status,
      message: result.message
    });
  } catch (error) {
    console.error("Error sending message to AI:", error);
    return NextResponse.json(
      { error: "Failed to send message to AI" },
      { status: 500 }
    );
  }
}
