const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const path = require("path");
const mammoth = require("mammoth");
const pdfParse = require("pdf-parse");
const fs = require("fs");
const {JSDOM, } = require("jsdom")


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


const puppeteer = require("puppeteer");

async function extractTextFromUrl(url) {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: "networkidle2" }); // waits for JS to load
  const text = await page.evaluate(() => document.body.innerText);
  await browser.close();
  var respText = text.replace(/\s+/g, " ").trim();
  console.log(respText);
  return respText;
}

module.exports.extractTextFromFile = extractTextFromFile;
module.exports.extractTextFromUrl = extractTextFromUrl;
