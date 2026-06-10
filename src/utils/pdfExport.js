import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { downloadBlob, getCurriculumFilename } from "./downloadHelper";

export function generateCurriculumPDF(curriculumData) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  const primaryColor = [79, 70, 229];
  const primaryLight = [238, 242, 255];
  const accentColor = [16, 185, 129];
  const accentLight = [240, 253, 244];
  const darkText = [17, 24, 39];
  const grayText = [107, 114, 128];
  const borderColor = [229, 231, 235];
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 12;
  const bottomLimit = pageHeight - margin;
  const contentWidth = pageWidth - margin * 2;
  const lineHeight = 4;
  const cardGap = 5;
  const semestersList = curriculumData.semestersData || [];

  const skillName = curriculumData.skill || "Curriculum";
  const appName = curriculumData.appName || "CurrHub";
  const totalSemesters = curriculumData.totalSemesters || curriculumData.semesters;
  const generatedDate = new Date().toLocaleDateString();

  let y = margin;

  const ensureSpace = (needed) => {
    if (y + needed > bottomLimit) {
      doc.addPage();
      y = margin;
    }
  };

  const startNewPage = () => {
    doc.addPage();
    y = margin;
  };

  const drawBanner = (title, color = primaryColor, height = 14) => {
    ensureSpace(height + 4);
    doc.setFillColor(...color);
    doc.rect(margin, y, contentWidth, height, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text(title, margin + 4, y + height / 2 + 1.5);
    y += height + 4;
  };

  const drawSectionPageHeader = (title, subtitle, color) => {
    doc.setFillColor(...color);
    doc.rect(0, 0, pageWidth, 24, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(15);
    doc.setFont("helvetica", "bold");
    doc.text(title, margin, 13);
    if (subtitle) {
      doc.setFontSize(8.5);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(255, 255, 255);
      doc.text(subtitle, margin, 19);
    }
    y = 32;
  };

  const measureTextHeight = (text, maxWidth, fontSize = 8) => {
    doc.setFontSize(fontSize);
    return doc.splitTextToSize(text, maxWidth).length * lineHeight;
  };

  const measureCourseCardHeight = (course, innerWidth) => {
    const descHeight = measureTextHeight(course.description || "N/A", innerWidth, 8);
    let height = 26 + descHeight + 6;
    if (course.learningOutcomes?.length) {
      height += 8;
      course.learningOutcomes.forEach((outcome) => {
        height += doc.splitTextToSize(`✓  ${outcome}`, innerWidth - 6).length * lineHeight + 1;
      });
    }
    return height + 6;
  };

  const drawCourseCard = ({ semester, course }) => {
    const cardInnerX = margin + 8;
    const cardInnerWidth = contentWidth - 16;
    const cardHeight = measureCourseCardHeight(course, cardInnerWidth);

    ensureSpace(cardHeight + cardGap);
    const cardTop = y;

    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(...borderColor);
    doc.setLineWidth(0.3);
    doc.rect(margin, cardTop, contentWidth, cardHeight, "FD");

    doc.setFillColor(...primaryColor);
    doc.rect(margin, cardTop, 3.5, cardHeight, "F");

    y = cardTop + 6;

    doc.setTextColor(...darkText);
    doc.setFontSize(10.5);
    doc.setFont("helvetica", "bold");
    doc.text(course.courseName || "Untitled Course", cardInnerX, y);

    const codeLabel = course.courseCode || "N/A";
    const codeWidth = doc.getTextWidth(codeLabel) + 6;
    doc.setFillColor(...primaryLight);
    doc.setDrawColor(224, 231, 255);
    doc.rect(margin + contentWidth - codeWidth - 6, cardTop + 5, codeWidth, 6, "FD");
    doc.setFontSize(7);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...primaryColor);
    doc.text(codeLabel, margin + contentWidth - codeWidth - 3, cardTop + 9.5);

    y += 7;
    doc.setFontSize(7.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...grayText);
    doc.text(
      `Semester ${semester.semesterNumber}   •   ${course.credits ?? "N/A"} Credits   •   ${course.weeklyHours ?? "N/A"} Hrs/Week`,
      cardInnerX,
      y
    );
    y += 6;

    doc.setFillColor(...primaryLight);
    doc.rect(cardInnerX, y, cardInnerWidth, 5, "F");
    doc.setFontSize(7.5);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...primaryColor);
    doc.text("DESCRIPTION", cardInnerX + 2, y + 3.5);
    y += 8;

    doc.setFont("helvetica", "normal");
    doc.setTextColor(...grayText);
    doc.setFontSize(8);
    const descLines = doc.splitTextToSize(course.description || "N/A", cardInnerWidth);
    descLines.forEach((line) => {
      doc.text(line, cardInnerX, y);
      y += lineHeight;
    });

    if (course.learningOutcomes?.length) {
      y += 3;
      doc.setFillColor(236, 253, 245);
      const outcomesStartY = y;
      let outcomesHeight = 7;
      course.learningOutcomes.forEach((outcome) => {
        outcomesHeight += doc.splitTextToSize(`✓  ${outcome}`, cardInnerWidth - 6).length * lineHeight + 1;
      });
      outcomesHeight += 3;

      doc.rect(cardInnerX, outcomesStartY, cardInnerWidth, outcomesHeight, "F");
      doc.setDrawColor(167, 243, 208);
      doc.setLineWidth(0.2);
      doc.rect(cardInnerX, outcomesStartY, cardInnerWidth, outcomesHeight, "S");

      y = outcomesStartY + 5;
      doc.setFontSize(7.5);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(6, 95, 70);
      doc.text("LEARNING OUTCOMES", cardInnerX + 2, y);
      y += 5;

      doc.setFont("helvetica", "normal");
      doc.setTextColor(55, 65, 81);
      doc.setFontSize(8);
      course.learningOutcomes.forEach((outcome) => {
        const outcomeLines = doc.splitTextToSize(`✓  ${outcome}`, cardInnerWidth - 6);
        outcomeLines.forEach((line) => {
          doc.text(line, cardInnerX + 2, y);
          y += lineHeight;
        });
        y += 1;
      });
    }

    y = cardTop + cardHeight + cardGap;
  };

  const drawCapstoneIntroCard = (capstone) => {
    const innerX = margin + 6;
    const innerWidth = contentWidth - 12;
    const descHeight = measureTextHeight(capstone.description || "N/A", innerWidth, 9);
    const cardHeight = 18 + descHeight + 8;

    ensureSpace(cardHeight);
    const cardTop = y;

    doc.setFillColor(...accentLight);
    doc.setDrawColor(167, 243, 208);
    doc.setLineWidth(0.4);
    doc.rect(margin, cardTop, contentWidth, cardHeight, "FD");

    doc.setFillColor(...accentColor);
    doc.rect(margin, cardTop, contentWidth, 3, "F");

    y = cardTop + 10;
    doc.setTextColor(...darkText);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text(capstone.title || "Capstone Project", innerX, y);
    y += 8;

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...grayText);
    const descLines = doc.splitTextToSize(capstone.description || "N/A", innerWidth);
    descLines.forEach((line) => {
      doc.text(line, innerX, y);
      y += lineHeight + 0.5;
    });

    y = cardTop + cardHeight + 6;
  };

  const drawCapstoneDeliverables = (deliverables) => {
    const innerX = margin + 6;
    const innerWidth = contentWidth - 12;

    ensureSpace(12);
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(6, 95, 70);
    doc.text("KEY DELIVERABLES", innerX, y);
    y += 7;

    deliverables.forEach((item, index) => {
      const itemLines = doc.splitTextToSize(item, innerWidth - 14);
      const itemHeight = itemLines.length * lineHeight + 6;
      ensureSpace(itemHeight + 3);

      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(187, 247, 208);
      doc.setLineWidth(0.3);
      doc.rect(innerX, y - 3, innerWidth, itemHeight, "FD");

      doc.setFillColor(...accentColor);
      doc.circle(innerX + 4, y + 1.5, 2, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(6);
      doc.setFont("helvetica", "bold");
      doc.text(String(index + 1), innerX + 3.2, y + 2.3);

      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(55, 65, 81);
      let itemY = y;
      itemLines.forEach((line) => {
        doc.text(line, innerX + 9, itemY);
        itemY += lineHeight;
      });
      y += itemHeight + 3;
    });
  };

  // ── Title block ──
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, pageWidth, 38, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text(appName, pageWidth / 2, 12, { align: "center" });

  doc.setFontSize(20);
  doc.text(`${skillName} Curriculum`, pageWidth / 2, 24, { align: "center" });

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text(
    `${curriculumData.level || "N/A"}  •  ${totalSemesters || "N/A"} Semesters  •  ${curriculumData.weeklyHours ?? "N/A"} hrs/week`,
    pageWidth / 2,
    33,
    { align: "center" }
  );

  y = 46;
  doc.setTextColor(...darkText);
  doc.setFontSize(9);

  const metaLeft = [
    ["Skill Domain", skillName],
    ["Industry Focus", curriculumData.industryFocus || "General"],
    ["Institution", curriculumData.college || "N/A"],
  ];
  const metaRight = [
    ["Education Level", curriculumData.level || "N/A"],
    ["Author", curriculumData.publishedByName || "Faculty"],
    ["Generated", generatedDate],
  ];

  const colWidth = contentWidth / 2 - 4;
  metaLeft.forEach(([label, value], i) => {
    const rowY = y + i * 7;
    doc.setFont("helvetica", "bold");
    doc.text(`${label}:`, margin, rowY);
    doc.setFont("helvetica", "normal");
    doc.text(String(value), margin + 30, rowY, { maxWidth: colWidth - 30 });
  });
  metaRight.forEach(([label, value], i) => {
    const rowY = y + i * 7;
    const x = margin + contentWidth / 2 + 4;
    doc.setFont("helvetica", "bold");
    doc.text(`${label}:`, x, rowY);
    doc.setFont("helvetica", "normal");
    doc.text(String(value), x + 30, rowY, { maxWidth: colWidth - 30 });
  });

  y += metaLeft.length * 7 + 6;

  // ── Semester overview ──
  if (semestersList.length > 0) {
    drawBanner("Semester Overview");

    semestersList.forEach((semester) => {
      const semesterLabel = `Semester ${semester.semesterNumber}${semester.semesterTitle ? `: ${semester.semesterTitle}` : ""}`;
      ensureSpace(14);

      doc.setFillColor(...primaryLight);
      doc.rect(margin, y, contentWidth, 8, "F");
      doc.setTextColor(...primaryColor);
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.text(semesterLabel, margin + 3, y + 5.5);
      y += 10;

      const tableData = (semester.courses || []).map((course) => [
        course.courseName || "N/A",
        course.courseCode || "N/A",
        course.credits !== undefined ? String(course.credits) : "N/A",
        course.weeklyHours !== undefined ? String(course.weeklyHours) : "N/A",
        Array.isArray(course.topics) ? course.topics.join(", ") : "",
      ]);

      autoTable(doc, {
        startY: y,
        head: [["Course Name", "Code", "Credits", "Hrs/Wk", "Topics"]],
        body: tableData,
        theme: "grid",
        headStyles: {
          fillColor: primaryColor,
          textColor: [255, 255, 255],
          fontStyle: "bold",
          fontSize: 8,
          cellPadding: 2,
        },
        bodyStyles: { fontSize: 7.5, textColor: darkText, cellPadding: 2 },
        alternateRowStyles: { fillColor: [249, 250, 251] },
        columnStyles: {
          0: { cellWidth: 40 },
          1: { cellWidth: 22 },
          2: { cellWidth: 16 },
          3: { cellWidth: 16 },
          4: { cellWidth: "auto" },
        },
        margin: { left: margin, right: margin },
        pageBreak: "auto",
        rowPageBreak: "avoid",
      });

      y = doc.lastAutoTable.finalY + 5;
    });
  }

  // ── Course details (fresh page) ──
  const allCourses = semestersList.flatMap((semester) =>
    (semester.courses || []).map((course) => ({ semester, course }))
  );

  if (allCourses.length > 0) {
    startNewPage();
    drawSectionPageHeader(
      "Course Details",
      "In-depth descriptions and learning outcomes for every course",
      primaryColor
    );

    allCourses.forEach((entry) => {
      drawCourseCard(entry);
    });
  }

  // ── Capstone (fresh page) ──
  if (curriculumData.capstoneProject) {
    startNewPage();
    drawSectionPageHeader(
      "Capstone Project",
      "Final integrative project synthesizing the full curriculum",
      accentColor
    );
    drawCapstoneIntroCard(curriculumData.capstoneProject);
    if (curriculumData.capstoneProject.deliverables?.length) {
      drawCapstoneDeliverables(curriculumData.capstoneProject.deliverables);
    }
  }

  const fileName = getCurriculumFilename(skillName, "pdf");
  try {
    const blob = doc.output("blob");
    downloadBlob(blob, fileName);
  } catch (err) {
    console.error("PDF download failed:", err);
    doc.save(fileName);
  }
}
