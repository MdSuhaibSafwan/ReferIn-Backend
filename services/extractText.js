const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const path = require("path");
const mammoth = require("mammoth");
const pdfParse = require("pdf-parse");
const fs = require("fs");
const {JSDOM, } = require("jsdom")
const chromium = require("@sparticuz/chromium");
const puppeteer = require("puppeteer-core");

async function extractTextFromFile(filePath) {
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


async function extractTextFromUrl(url) {
  // Launch headless Chromium
  const browser = await puppeteer.launch({
    args: chromium.args,
    defaultViewport: chromium.defaultViewport,
    executablePath: await chromium.executablePath(),
    headless: chromium.headless,
  });

  const page = await browser.newPage();
  await page.goto(url, { waitUntil: "networkidle2" });

  // Extract page content
  const text = await page.evaluate(() => document.body.innerText);

  await browser.close();
  return text;
}

module.exports.extractTextFromFile = extractTextFromFile;
module.exports.extractTextFromUrl = extractTextFromUrl;