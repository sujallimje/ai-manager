// src/app/api/chat/route.ts
import { NextResponse } from "next/server";
import axios from "axios";

const GROQ_API_KEY = "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";

export async function POST(req: Request) {
  try {
    const { message } = await req.json();
    
    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama3-70b-8192",
        messages: [
          {
            role: "system",
            content: "You are a helpful loan assistant for LoanVidya. Help users with their loan application process, answer questions about loan types, eligibility, required documents, and provide general guidance on financial matters. Keep answers concise and direct."
          },
          { role: "user", content: message }
        ],
        temperature: 0.7,
        max_tokens: 800
      },
      {
        headers: {
          Authorization: `Bearer ${GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    return NextResponse.json(response.data);
    
  } catch (error: any) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: error.message, details: error.response?.data },
      { status: error.response?.status || 500 }
    );
  }
}