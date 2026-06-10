import { downloadBlob, getCurriculumFilename } from "./downloadHelper";
import { generateCurriculumPDF } from "./pdfExport";

const APP_NAME = "CurrHub";

export function buildExportPayload(curriculum) {
  const generated = curriculum.generatedData || {};
  return {
    ...generated,
    skill: curriculum.skill || generated.skill,
    level: curriculum.level || generated.level,
    semesters: curriculum.semesters ?? generated.semesters,
    weeklyHours: curriculum.weeklyHours ?? generated.weeklyHours,
    industryFocus: curriculum.industryFocus || generated.industryFocus || "General",
    publishedByName: curriculum.publishedByName,
    college: curriculum.college,
    appName: APP_NAME,
  };
}

export function buildJSONExportData(curriculum) {
  const generated = curriculum.generatedData || {};
  return {
    skill: curriculum.skill || generated.skill,
    level: curriculum.level || generated.level,
    semesters: curriculum.semesters ?? generated.semesters,
    weeklyHours: curriculum.weeklyHours ?? generated.weeklyHours,
    industryFocus: curriculum.industryFocus || generated.industryFocus,
    publishedByName: curriculum.publishedByName,
    college: curriculum.college,
    publishedBy: curriculum.publishedBy,
    status: curriculum.status,
    createdAt: curriculum.createdAt,
    publishedAt: curriculum.publishedAt,
    generatedData: generated,
    semestersData: generated.semestersData,
    capstoneProject: generated.capstoneProject,
  };
}

export function exportCurriculumJSON(curriculum) {
  const jsonString = JSON.stringify(buildJSONExportData(curriculum), null, 2);
  const blob = new Blob([jsonString], { type: "application/json" });
  const filename = getCurriculumFilename(curriculum.skill, "json");
  downloadBlob(blob, filename);
}

export function exportCurriculumPDF(curriculum) {
  generateCurriculumPDF(buildExportPayload(curriculum));
}
