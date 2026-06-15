import fs from "fs";
import path from "path";
import { chromium } from "playwright";

async function main() {
  const mdPath = path.join(process.cwd(), "playbooks", "DealFlow-ICP-Playbook-FINAL.md");
  if (!fs.existsSync(mdPath)) {
    console.error(`Markdown playbook not found at ${mdPath}`);
    return;
  }
  const markdown = fs.readFileSync(mdPath, "utf8");

  // Basic markdown conversion
  let html = markdown
    .replace(/^# (.*$)/gim, "<h1>$1</h1>")
    .replace(/^## (.*$)/gim, "<h2>$1</h2>")
    .replace(/^### (.*$)/gim, "<h3>$1</h3>")
    .replace(/^#### (.*$)/gim, "<h4>$1</h4>")
    .replace(/^\* (.*$)/gim, "<li>$1</li>")
    .replace(/^- (.*$)/gim, "<li>$1</li>")
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/\n/g, "<br/>");

  // Nice style
  const fullHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>DealFlow ICP Playbook</title>
      <style>
        body {
          font-family: 'Inter', -apple-system, sans-serif;
          color: #1a1a1a;
          line-height: 1.6;
          padding: 40px;
          max-width: 800px;
          margin: 0 auto;
        }
        h1 {
          font-size: 28px;
          color: #0d9488;
          border-bottom: 2px solid #0d9488;
          padding-bottom: 10px;
          margin-top: 30px;
        }
        h2 {
          font-size: 20px;
          color: #0f172a;
          margin-top: 25px;
          border-bottom: 1px solid #e2e8f0;
          padding-bottom: 5px;
        }
        h3 {
          font-size: 16px;
          color: #334155;
          margin-top: 20px;
        }
        li {
          margin-bottom: 6px;
        }
        strong {
          color: #0f172a;
        }
      </style>
    </head>
    <body>
      ${html}
    </body>
    </html>
  `;

  const tempHtmlPath = path.join(process.cwd(), "playbooks", "temp.html");
  fs.writeFileSync(tempHtmlPath, fullHtml);

  console.log("Launching browser to generate PDF...");
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto(`file://${tempHtmlPath}`);
  
  const destDir = path.join(process.cwd(), "public", "docs");
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }
  
  const pdfPath = path.join(destDir, "DealFlow-ICP-Playbook-FINAL.pdf");
  await page.pdf({
    path: pdfPath,
    format: "A4",
    margin: { top: "20mm", bottom: "20mm", left: "20mm", right: "20mm" },
    printBackground: true
  });

  console.log(`PDF successfully generated at ${pdfPath}`);
  
  await browser.close();
  fs.unlinkSync(tempHtmlPath);
}

main().catch(console.error);
