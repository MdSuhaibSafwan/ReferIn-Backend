const path = require("path");
const mammoth = require("mammoth");
const pdfParse = require("pdf-parse");
const fs = require("fs");

async function extractText(filePath) {
  const ext = path.extname(filePath).toLowerCase();

  if (ext === ".pdf") {
    const dataBuffer = fs.readFileSync(filePath);
    const pdfData = await pdfParse(dataBuffer);
    return pdfData.text;
  } else if (ext === ".docx") {
    const result = await mammoth.extractRawText({ path: filePath });
    return result.value; // extracted text
  } else {
    throw new Error("Unsupported file type");
  }
}

module.exports = extractText;
