//openai charts chat.js

import { NextResponse } from "next/server";
import getDb from "../../lib/mongodb";

export async function POST(req) {
  try {
    const userId = req.headers.get("x-user-id");
    if (!userId)
      return NextResponse.json({ error: "Missing x-user-id header" }, { status: 400 });

    const { message } = await req.json();
    if (!message)
      return NextResponse.json({ error: "Missing message" }, { status: 400 });

    const db = await getDb();

    const dataset = await db
      .collection("datasets")
      .find({ userId })
      .sort({ uploadedAt: -1 })
      .limit(1)
      .next();

    if (!dataset)
      return NextResponse.json({
        type: "text",
        text: "Please upload a dataset first.",
        sender: "bot",
      });

    const preview = (dataset.preview || []).slice(0, 10);
    const numericStats = dataset.stats || {};
    const groupedData = dataset.groupedStats || {};

    // System prompt
    const messages = [
      {
        role: "system",
        content: `
You are a helpful data analyst.
- Answer the user's questions about the dataset in clear text.
- Do NOT generate charts or return JSON for charts.
- Use the dataset information (columns, stats, grouped data, preview) to answer.
        `,
      },
      {
        role: "user",
        content: `
Dataset summary:
Columns: ${dataset.columns.join(", ")}
Numeric stats: ${JSON.stringify(numericStats, null, 2)}
Grouped data: ${JSON.stringify(groupedData, null, 2)}
Preview (10 rows): ${JSON.stringify(preview, null, 2)}

User question: ${message}
        `,
      },
    ];

    const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages,
        max_tokens: 800,
      }),
    });

    const data = await openaiRes.json();
    const rep = data?.choices?.[0]?.message?.content ?? "No reply from model.";

    // Always return text only
    const responseMessage = { type: "text", text: rep.trim(), sender: "bot" };

    return NextResponse.json(responseMessage);
  } catch (err) {
    console.error("Chat API error:", err);
    return NextResponse.json(
      { type: "text", text: "Server error", sender: "bot" },
      { status: 500 }
    );
  }
}
