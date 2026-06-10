/**
 * Helper function to programmatically trigger a download of a Blob with a specific filename.
 * This avoids Chrome/Edge security restrictions on direct data URIs and ensures that
 * downloaded files are correctly named with their extensions instead of being saved as UUIDs.
 *
 * @param {Blob} blob - The Blob to download.
 * @param {string} filename - The desired filename for the download.
 */
export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.style.display = "none";

  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 150);
}

export function getCurriculumFilename(skill, extension) {
  const slug = (skill || "curriculum")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return `${slug}-curriculum.${extension}`;
}
