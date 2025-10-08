//trying json
// src/app/api/upload/route.js
import { NextResponse } from "next/server";
import getDb from "../../lib/mongodb";

export async function POST(req) {
  try {
    const userId = req.headers.get("x-user-id");
    if (!userId) return NextResponse.json({ error: "Missing x-user-id" }, { status: 400 });

    const formData = await req.formData();
    const file = formData.get("file");
    if (!file) return NextResponse.json({ error: "No file uploaded" }, { status: 400 });

    const text = await file.text();
    const json = JSON.parse(text);
    if (!Array.isArray(json)) return NextResponse.json({ error: "JSON must be an array" }, { status: 400 });

    const db = await getDb();

    // Compute summaries
    const platforms = {};
    const emotions = ["joy","fear","love","anger","sadness","surprise"];
    const emotionTotals = {};
    emotions.forEach(e => emotionTotals[e] = 0);

    let totalViews = 0, totalShares = 0, totalLikes = 0, totalDislikes = 0;
    let sentimentTotals = { positive: 0, negative: 0, neutral: 0 };

    json.forEach(post => {
      // Platform aggregation
      platforms[post.platform] = (platforms[post.platform] || 0) + (post.engagement || 0);

      // Views & shares
      totalViews += post.views || 0;
      totalShares += post.shares || 0;

      // Likes & dislikes
      totalLikes += post.reactions?.likes || 0;
      totalDislikes += post.reactions?.dislikes || 0;

      // Sentiment sums
      sentimentTotals.positive += post.text_analysis?.Sentiment?.positive || 0;
      sentimentTotals.negative += post.text_analysis?.Sentiment?.negative || 0;
      sentimentTotals.neutral += post.text_analysis?.Sentiment?.neutral || 0;

      // Emotions
      emotions.forEach(e => {
        emotionTotals[e] += post.text_analysis?.Emotion?.[e] || 0;
      });
    });

    // Top 5 posts by engagement
    const topPosts = [...json].sort((a,b) => (b.engagement || 0) - (a.engagement || 0)).slice(0,5);

    // Post frequency per platform
    const postFrequency = {};
    json.forEach(p => postFrequency[p.platform] = (postFrequency[p.platform] || 0) + 1);

    // Store in DB
    await db.collection("datasets").insertOne({
      userId,
      uploadedAt: new Date(),
      columns: Object.keys(json[0] || {}),
      preview: json.slice(0, 10),
      stats: {
        totalViews,
        totalShares,
        totalLikes,
        totalDislikes,
        sentimentTotals,
        emotionTotals
      },
      groupedStats: {
        platformEngagement: platforms,
        postFrequency
      },
      topPosts
    });

    return NextResponse.json({ success: true, message: "Dataset uploaded and summaries computed." });
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json({ error: "Failed to process dataset" }, { status: 500 });
  }
}
