const { DatabaseSync } = require("node:sqlite");
const fs = require("fs");

const RATING_WORDS = {
  One: 1,
  Two: 2,
  Three: 3,
  Four: 4,
  Five: 5,
};

const db = new DatabaseSync("report.db");

// Create the table if it doesn't exist yet
db.exec(`
  CREATE TABLE IF NOT EXISTS books (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    price REAL NOT NULL,
    rating INTEGER,
    url TEXT
  )
`);
db.exec(`
  CREATE TABLE IF NOT EXISTS reports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    path TEXT NOT NULL,
    created_at TEXT NOT NULL
  )
`);

// Delete all existing rows first, so running this twice doesn't double the data
db.exec("DELETE FROM books");

// Read the scraped book data
const books = JSON.parse(fs.readFileSync("books.json", "utf8"));

const insert = db.prepare(
  "INSERT INTO books (title, price, rating, url) VALUES (?, ?, ?, ?)",
);

for (const book of books) {
  insert.run(
    book.title,
    book.price_gbp,
    RATING_WORDS[book.rating_text] ?? null,
    book.product_url,
  );
}

console.log(`Seeded ${books.length} books into report.db`);

db.close();
