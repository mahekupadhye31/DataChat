import { NextResponse } from "next/server";
import getDb from "../../lib/mongodb";

export async function POST(req) {
  try {
    const userId = req.headers.get("x-user-id");
    if (!userId) return NextResponse.json({ error: "Missing x-user-id header" }, { status: 400 });

    const { chartSummaries } = await req.json();
    if (!chartSummaries) return NextResponse.json({ error: "No chart summaries provided" }, { status: 400 });

    const db = await getDb();

    // Update the latest dataset with chart summaries
    const result = await db.collection("datasets").findOneAndUpdate(
      { userId },
      { $set: { chartSummaries, updatedAt: new Date() } },
      { sort: { uploadedAt: -1 }, returnDocument: "after" }
    );

    if (!result.value) {
      return NextResponse.json({ error: "No dataset found to attach chart summaries" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Chart summaries saved successfully",
      datasetId: result.value._id,
    });
  } catch (err) {
    console.error("Save charts API error:", err);
    return NextResponse.json({ error: "Server error while saving chart summaries" }, { status: 500 });
  }
}
