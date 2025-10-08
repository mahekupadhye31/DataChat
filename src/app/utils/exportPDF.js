import jsPDF from "jspdf";
import html2canvas from "html2canvas";

/**
 * Export charts and chat messages as a single PDF.
 * @param {Array} chartRefs - Array of chart refs (from chartRefs.current)
 * @param {Object} chatRef - Ref of the chat container
 */
export const exportPDF = async (chartRefs, chatRef) => {
  if (!chartRefs || chartRefs.length === 0) {
    alert("No charts to export!");
    return;
  }

  const pdf = new jsPDF("p", "pt", "a4");
  let yOffset = 20; // starting y position

  // Export each chart
  for (let i = 0; i < chartRefs.length; i++) {
    const chartEl = chartRefs[i].current;
    if (!chartEl) continue;

    // Capture chart as canvas
    const canvas = await html2canvas(chartEl, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");

    const pdfWidth = pdf.internal.pageSize.getWidth() - 40; // margin 20px
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    if (yOffset + pdfHeight > pdf.internal.pageSize.getHeight()) {
      pdf.addPage();
      yOffset = 20;
    }

    pdf.addImage(imgData, "PNG", 20, yOffset, pdfWidth, pdfHeight);
    yOffset += pdfHeight + 20;
  }

  // Export chat messages
  if (chatRef && chatRef.current) {
    const chatCanvas = await html2canvas(chatRef.current, { scale: 2 });
    const chatImg = chatCanvas.toDataURL("image/png");

    if (yOffset + chatCanvas.height > pdf.internal.pageSize.getHeight()) {
      pdf.addPage();
      yOffset = 20;
    }

    const pdfWidth = pdf.internal.pageSize.getWidth() - 40;
    const pdfHeight = (chatCanvas.height * pdfWidth) / chatCanvas.width;
    pdf.addImage(chatImg, "PNG", 20, yOffset, pdfWidth, pdfHeight);
  }

  pdf.save("report.pdf");
};
