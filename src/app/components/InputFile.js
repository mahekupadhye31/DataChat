
"use client";
import { useState, useEffect, useRef } from "react";
import { getUserId } from "../lib/getUserId";

export default function InputFile() {
  const [file, setFile] = useState(null);
  const [fileData, setFileData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState("");
  const [showCharts, setShowCharts] = useState(false);

  // Chart refs
  const engagementRef = useRef(null);
  const platformRef = useRef(null);
  const sentimentRef = useRef(null);
  const emotionRef = useRef(null);
  const topPostsRef = useRef(null);
  const viewsSharesRef = useRef(null);
  const likesDislikesRef = useRef(null);
  const sentimentOverTimeRef = useRef(null);
  const emotionByPlatformRef = useRef(null);
  const postFrequencyRef = useRef(null);

  // File change handler
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;
    setFile(selectedFile);

    if (selectedFile.type === "application/json") {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const json = JSON.parse(event.target.result);
          if (!Array.isArray(json)) return alert("JSON must be an array of posts");
          setFileData(json);
          setAnalysis("JSON loaded. Click 'Upload & Analyze' to see charts.");
        } catch {
          alert("Invalid JSON file");
        }
      };
      reader.readAsText(selectedFile);
    } else {
      setFileData(null);
    }
  };

  // Upload & Analyze
  const handleUpload = async () => {
    if (!file) return alert("Please upload a JSON file first.");
    setLoading(true);
    setShowCharts(false);

    const formData = new FormData();
    formData.append("file", file);
    const userId = getUserId();

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
        headers: { "x-user-id": userId },
      });
      const data = await res.json();
      if (data.success) {
        setAnalysis(`Upload complete: ${data.message}`);
        setShowCharts(true);
      } else {
        setAnalysis(`Error: ${data.error || "Unknown"}`);
      }
    } catch {
      setAnalysis("Upload failed.");
    } finally {
      setLoading(false);
    }
  };

  // Create charts
  const createChart = (ref, data, layout) => {
    import("plotly.js-dist-min").then((module) => {
      const Plotly = module.default;
      Plotly.newPlot(ref.current, data, layout);
    });
  };

  // Draw charts
  useEffect(() => {
    if (!fileData || !showCharts) return;

    const emotions = ["joy","fear","love","anger","sadness","surprise"];

    // 1. Engagement Over Time
    createChart(engagementRef, [{
      x: fileData.map(d => d.timestamp),
      y: fileData.map(d => d.engagement),
      type: "scatter",
      mode: "lines+markers",
      name: "Engagement"
    }], { title: { text: "Engagement Over Time", font: { size: 25 }, automargin: true }, width: 550, height: 350 });

    // 2. Platform Performance
    const platformAgg = {};
    fileData.forEach(d => platformAgg[d.platform] = (platformAgg[d.platform] || 0) + d.engagement);
    createChart(platformRef, [{
      x: Object.keys(platformAgg),
      y: Object.values(platformAgg),
      type: "bar"
    }], { title: { text: "Platform Performance", font: { size: 25 }, automargin: true }, width: 550, height: 350 });

    // 3. Sentiment Distribution
    let pos=0, neg=0, neu=0;
    fileData.forEach(d => {
      pos += d.text_analysis?.Sentiment?.positive || 0;
      neg += d.text_analysis?.Sentiment?.negative || 0;
      neu += d.text_analysis?.Sentiment?.neutral || 0;
    });
    createChart(sentimentRef, [{
      labels: ["Positive","Negative","Neutral"],
      values: [pos, neg, neu],
      type: "pie"
    }], { title: { text: "Overall Sentiment Distribution", font: { size: 25 }, automargin: true }, width: 550, height: 350 });

    // 4. Emotion Radar
    const totals = {};
    emotions.forEach(e => totals[e]=0);
    fileData.forEach(d => emotions.forEach(e => totals[e]+=d.text_analysis?.Emotion?.[e]||0));
    createChart(emotionRef, [{
      type: "scatterpolar",
      r: Object.values(totals),
      theta: emotions,
      fill: "toself"
    }], { title: { text: "Emotion Analysis", font: { size: 25 }, automargin: true }, polar: { radialaxis: { visible: true } }, width: 550, height: 350 });

    // 5. Top 5 Posts
    const sortedPosts = [...fileData].sort((a,b)=>b.engagement-a.engagement).slice(0,5);
    createChart(topPostsRef, [{
      x: sortedPosts.map(d=>d.post_id),
      y: sortedPosts.map(d=>d.engagement),
      text: sortedPosts.map(d=>d.text),
      type: "bar"
    }], { title: { text: "Top 5 Posts", font: { size: 25 }, automargin: true }, width: 550, height: 350 });

    // 6. Views & Shares Over Time
    createChart(viewsSharesRef, [
      { x: fileData.map(d=>d.timestamp), y: fileData.map(d=>d.views), type: "scatter", mode: "lines+markers", name: "Views" },
      { x: fileData.map(d=>d.timestamp), y: fileData.map(d=>d.shares), type: "scatter", mode: "lines+markers", name: "Shares" }
    ], { title: { text: "Views & Shares Over Time", font: { size: 25 }, automargin: true }, width: 550, height: 350 });

    // 7. Likes vs Dislikes
    createChart(likesDislikesRef, [
      { x: fileData.map(d=>d.post_id), y: fileData.map(d=>d.reactions.likes), name: "Likes", type: "bar" },
      { x: fileData.map(d=>d.post_id), y: fileData.map(d=>d.reactions.dislikes), name: "Dislikes", type: "bar" }
    ], { barmode:"stack", title:{text:"Likes vs Dislikes per Post", font:{size:25}, automargin:true}, width:550, height:350 });

    // 8. Sentiment Over Time
    createChart(sentimentOverTimeRef, [
      { x: fileData.map(d=>d.timestamp), y: fileData.map(d=>d.text_analysis?.Sentiment?.positive||0), type:"scatter", mode:"lines+markers", name:"Positive" },
      { x: fileData.map(d=>d.timestamp), y: fileData.map(d=>d.text_analysis?.Sentiment?.negative||0), type:"scatter", mode:"lines+markers", name:"Negative" },
      { x: fileData.map(d=>d.timestamp), y: fileData.map(d=>d.text_analysis?.Sentiment?.neutral||0), type:"scatter", mode:"lines+markers", name:"Neutral" }
    ], { title:{text:"Sentiment Over Time", font:{size:25}, automargin:true}, width:550, height:350 });

    // 9. Emotion by Platform
    const platforms = [...new Set(fileData.map(d=>d.platform))];
    const traces = emotions.map(emotion=>({
      x: platforms,
      y: platforms.map(p => fileData.filter(d=>d.platform===p).reduce((sum,d)=>sum+(d.text_analysis?.Emotion?.[emotion]||0),0)),
      name: emotion,
      type:"bar"
    }));
    createChart(emotionByPlatformRef, traces, { barmode:"stack", title:{text:"Emotion by Platform", font:{size:25}, automargin:true}, width:550, height:350 });

    // 10. Post Frequency by Platform
    const freq = {};
    fileData.forEach(d => freq[d.platform] = (freq[d.platform] || 0) + 1);
    createChart(postFrequencyRef, [{ x:Object.keys(freq), y:Object.values(freq), type:"bar" }], { title:{text:"Post Frequency by Platform", font:{size:25}, automargin:true}, width:550, height:350 });

  }, [fileData, showCharts]);

  return (
    <div className="bg-[#1A1B1C] mx-12 my-7 rounded-2xl p-1">
      <div className="p-4 mt-10">
        <label htmlFor="file" className="block mb-2 text-[35px] font-extrabold text-white">Draw Insights</label>
        <div className="text-gray-300 mb-4">Turn your data into clear, easy-to-understand insights.</div>

        <input id="file" type="file" accept=".json" onChange={handleFileChange} className="p-2 bg-[#3B3B3B] rounded-[10px] my-4 w-full" />

        <button onClick={handleUpload} disabled={loading} className="ml-0 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md">
          {loading ? "Analyzing..." : "Upload & Analyze"}
        </button>
        <button
            //onClick={handleExportPDF}
            className="ml-3 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md"
          >
            Export PDF
        </button>

        {analysis && <div className="mt-4 p-3 bg-[#2B2B2B] rounded-md text-white whitespace-pre-wrap">{analysis}</div>}

        {showCharts && (
          <div className="mt-10 space-y-10">
            <div ref={engagementRef} className="bg-[#2B2B2B] p-5 rounded-lg"></div>
            <div ref={platformRef} className="bg-[#2B2B2B] p-5 rounded-lg"></div>
            <div ref={sentimentRef} className="bg-[#2B2B2B] p-5 rounded-lg"></div>
            <div ref={emotionRef} className="bg-[#2B2B2B] p-5 rounded-lg"></div>
            <div ref={topPostsRef} className="bg-[#2B2B2B] p-5 rounded-lg"></div>
            <div ref={viewsSharesRef} className="bg-[#2B2B2B] p-5 rounded-lg"></div>
            <div ref={likesDislikesRef} className="bg-[#2B2B2B] p-5 rounded-lg"></div>
            <div ref={sentimentOverTimeRef} className="bg-[#2B2B2B] p-5 rounded-lg"></div>
            <div ref={emotionByPlatformRef} className="bg-[#2B2B2B] p-5 rounded-lg"></div>
            <div ref={postFrequencyRef} className="bg-[#2B2B2B] p-5 rounded-lg"></div>
          </div>
        )}
      </div>
    </div>
  );
}
