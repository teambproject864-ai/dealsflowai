import fs from "fs";
import path from "path";
import { chromium } from "playwright";

async function main() {
  const svgPath = path.resolve(__dirname, "../public/icons/integrated-voice-camera-icon.svg");
  const iconsDir = path.resolve(__dirname, "../public/icons");

  if (!fs.existsSync(svgPath)) {
    console.error(`SVG file not found at: ${svgPath}`);
    process.exit(1);
  }

  const svgContent = fs.readFileSync(svgPath, "utf-8");
  const sizes = [16, 32, 48, 256];

  console.log("Starting Playwright browser for premium SVG-to-PNG rasterization...");
  const browser = await chromium.launch();
  const page = await browser.newPage();

  for (const size of sizes) {
    console.log(`Rendering integrated-voice-camera-icon at ${size}x${size}px...`);

    // Load SVG in a minimal page with transparent background
    await page.setContent(`
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body, html {
              margin: 0;
              padding: 0;
              background: transparent;
              overflow: hidden;
              width: ${size}px;
              height: ${size}px;
            }
            svg {
              width: 100%;
              height: 100%;
              display: block;
            }
          </style>
        </head>
        <body>
          ${svgContent}
        </body>
      </html>
    `);

    // Set viewport exactly to target size
    await page.setViewportSize({ width: size, height: size });

    // Output file path
    const outFilename = `integrated-voice-camera-icon-${size}x${size}.png`;
    const outPath = path.join(iconsDir, outFilename);

    // Take screenshot with transparent background
    await page.screenshot({
      path: outPath,
      omitBackground: true,
      type: "png",
    });

    console.log(`Successfully exported: ${outPath}`);

    // If size is 256, also save it as the base default png
    if (size === 256) {
      const defaultPngPath = path.join(iconsDir, "integrated-voice-camera-icon.png");
      fs.copyFileSync(outPath, defaultPngPath);
      console.log(`Successfully exported default fallback: ${defaultPngPath}`);
    }
  }

  await browser.close();
  console.log("SVG-to-PNG rasterization completed successfully!");
}

main().catch((err) => {
  console.error("Rasterization failed:", err);
  process.exit(1);
});
