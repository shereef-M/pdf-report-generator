const express = require("express");
const path = require("path");
const { DatabaseSync } = require("node:sqlite");
const { chromium } = require("playwright");
const fs = require("fs");
const { getReportData } = require("./report");
const { buildReportHtml } = require("./render");

const app = express();
app.use(express.json());

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});
app.post("/reports", async (req, res) => {
  const db = new DatabaseSync("report.db");
  const force = req.body?.force === true;

  if (!force) {
    const today = new Date().toISOString().split("T")[0];
    const existing = db
      .prepare(
        "SELECT * FROM reports WHERE created_at LIKE ? ORDER BY id DESC LIMIT 1",
      )
      .get(`${today}%`);

    if (existing) {
      db.close();
      return res.status(200).json({
        id: existing.id,
        file: `/reports/${existing.id}/file`,
      });
    }
  }

  // Insert a placeholder row first, to get the auto-generated id
  const insertPlaceholder = db.prepare(
    "INSERT INTO reports (path, created_at) VALUES (?, ?)",
  );
  const result = insertPlaceholder.run("", new Date().toISOString());
  const id = result.lastInsertRowid;

  // Now build the actual PDF using that id
  const data = getReportData();
  const html = buildReportHtml(data);

  fs.mkdirSync("reports", { recursive: true });
  const filePath = `reports/${id}.pdf`;

  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setContent(html);
  await page.pdf({ path: filePath, format: "A4", printBackground: true });
  await browser.close();

  // Update the row with the real path
  db.prepare("UPDATE reports SET path = ? WHERE id = ?").run(filePath, id);
  db.close();

  res.status(201).json({
    id,
    file: `/reports/${id}/file`,
  });
});

app.get("/reports/:id", (req, res) => {
  const db = new DatabaseSync("report.db");
  const report = db
    .prepare("SELECT * FROM reports WHERE id = ?")
    .get(req.params.id);
  db.close();

  if (!report) {
    return res.status(404).json({ error: "Report not found" });
  }

  res.status(200).json({
    id: report.id,
    createdAt: report.created_at,
    file: `/reports/${report.id}/file`,
  });
});

app.get("/reports/:id/file", (req, res) => {
  const db = new DatabaseSync("report.db");
  const report = db
    .prepare("SELECT * FROM reports WHERE id = ?")
    .get(req.params.id);
  db.close();

  if (!report) {
    return res.status(404).json({ error: "Report not found" });
  }

  res.sendFile(path.resolve(report.path));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
