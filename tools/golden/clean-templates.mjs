// One-off: strip surplus sheets (old weeks' real data) from the export templates.
// Uses ExcelJS — the same library every v1 export already round-trips through — so
// shared strings belonging to the removed sheets are dropped as well.
import ExcelJS from "exceljs";

const KEEP = {
  "public/templates/evening-attendance-empty.xlsx": ["Sheet1"],
  "public/templates/weekend-attendance-empty.xlsx": ["T7", "CN"],
};

for (const [file, keep] of Object.entries(KEEP)) {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(file);
  for (const sheet of [...workbook.worksheets]) {
    if (!keep.includes(sheet.name)) workbook.removeWorksheet(sheet.id);
  }
  await workbook.xlsx.writeFile(file);
  console.log(file, "→", workbook.worksheets.map((s) => s.name).join(", "));
}
