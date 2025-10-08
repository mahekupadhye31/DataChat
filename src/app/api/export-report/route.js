// import { NextResponse } from "next/server";
// import { getRegisteredCharts } from "../../../lib/chartRegistry";
// import { getMessages } from "../../../lib/chatRegistry";
// import { PDFDocument, StandardFonts } from "pdf-lib";

// export async function POST() {
//   try {
//     const charts = getRegisteredCharts();
//     const messages = getMessages();

//     const pdfDoc = await PDFDocument.create();
//     const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

//     // Add a title page
//     const page = pdfDoc.addPage([595, 842]);
//     const { height } = page.getSize();
//     let y = height - 80;
//     page.drawText("📊 Social Media Insights Report", {
//       x: 50,
//       y,
//       size: 20,
//       font,
//     });
//     y -= 40;

//     // Convert all charts to images
//     for (const ref of charts) {
//       if (!ref?.current) continue;
//       const Plotly = (await import("plotly.js-dist-min")).default;
//       const dataUrl = await Plotly.toImage(ref.current, {
//         format: "png",
//         width: 500,
//         height: 350,
//       });
//       const imageBytes = await fetch(dataUrl).then((r) => r.arrayBuffer());
//       const pngImage = await pdfDoc.embedPng(imageBytes);
//       const pngDims = pngImage.scale(0.45);

//       if (y - pngDims.height < 60) {
//         y = height - 60;
//         pdfDoc.addPage();
//       }

//       const currentPage = pdfDoc.getPage(pdfDoc.getPageCount() - 1);
//       currentPage.drawImage(pngImage, {
//         x: 50,
//         y: y - pngDims.height,
//         width: pngDims.width,
//         height: pngDims.height,
//       });
//       y -= pngDims.height + 25;
//     }

//     // Add chat conversation page
//     const chatPage = pdfDoc.addPage([595, 842]);
//     let chatY = height - 50;
//     for (const msg of messages) {
//       const text = `${msg.sender === "user" ? "You" : "AI"}: ${msg.text}`;
//       chatPage.drawText(text, { x: 50, y: chatY, size: 10, font });
//       chatY -= 14;
//       if (chatY < 50) {
//         chatY = height - 50;
//         pdfDoc.addPage();
//       }
//     }

//     const pdfBytes = await pdfDoc.save();
//     return new NextResponse(pdfBytes, {
//       headers: {
//         "Content-Type": "application/pdf",
//         "Content-Disposition": "attachment; filename=Social_Media_Report.pdf",
//       },
//     });
//   } catch (err) {
//     console.error("Export error:", err);
//     return NextResponse.json({ error: "Failed to export" }, { status: 500 });
//   }
// }
