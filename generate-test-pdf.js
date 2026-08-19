const { chromium } = require("playwright");
const { getReportData } = require("./report");
const { buildReportHtml } = require("./render");

async function main() {
  const data = getReportData();
  const html = buildReportHtml(data);

  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setContent(html);
  await page.pdf({ path: "reports/test.pdf", format: "A4", printBackground: true });
  await browser.close();

  console.log("PDF generated at reports/test.pdf");
}

main();