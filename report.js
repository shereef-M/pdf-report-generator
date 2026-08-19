const { DatabaseSync } = require("node:sqlite");

function getReportData() {
  const db = new DatabaseSync("report.db");

  const totalBooks = db.prepare("SELECT COUNT(*) as count FROM books").get();

  const averagePrice = db.prepare("SELECT AVG(price) as avg FROM books").get();

  const topExpensive = db
    .prepare("SELECT title, price FROM books ORDER BY price DESC LIMIT 5")
    .all();

  const byRating = db
    .prepare("SELECT rating, COUNT(*) as count FROM books GROUP BY rating")
    .all();

  const allBooks = db
    .prepare("SELECT title, price, rating FROM books ORDER BY title")
    .all();

  db.close();

  return {
    totalBooks: totalBooks.count,
    averagePrice: averagePrice.avg,
    topExpensive,
    byRating,
    allBooks,
  };
}

module.exports = { getReportData };