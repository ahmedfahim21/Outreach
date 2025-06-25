import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest, { params }: { params: { sessionId: string } }) {
  try {
    const { sessionId } = await params;

    if (!sessionId) {
      return NextResponse.json(
        { error: "Session ID is required" },
        { status: 400 }
      );
    }

    const response = await fetch(`${process.env.PYTHON_AI_URL || 'http://localhost:5050'}/get_summary/${sessionId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      throw new Error('Failed to send message to AI');
    }

    const result = await response.json();
    
    return NextResponse.json({ 
      success: true, 
      status: 200,
      message: result
    });
  } catch (error) {
    console.error("Error sending message to AI:", error);
    return NextResponse.json(
      { error: "Failed to send message to AI" },
      { status: 500 }
    );
  }
}