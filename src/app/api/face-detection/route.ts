import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { image } = await req.json();
    console.log("📸 Received image from frontend");

    const response = await fetch("http://localhost:5000/monitor", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image }),
    });

    const result = await response.json();
    console.log("🔍 API Response from Flask:", result); // Debugging

    return NextResponse.json(result);
  } catch (error) {
    console.error("❌ Error in face detection API:", error);
    return NextResponse.json({ status: "error", message: "Internal Server Error" }, { status: 500 });
  }
}
