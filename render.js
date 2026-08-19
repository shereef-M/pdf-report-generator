function buildReportHtml(data) {
  const today = new Date().toLocaleDateString("en-GB", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const topExpensiveRows = data.topExpensive
    .map(
      (book) =>
        `<tr><td>${book.title}</td><td>£${book.price.toFixed(2)}</td></tr>`,
    )
    .join("");

  const allBooksRows = data.allBooks
    .map(
      (book) =>
        `<tr><td>${book.title}</td><td>£${book.price.toFixed(2)}</td><td>${book.rating}</td></tr>`,
    )
    .join("");

  return `
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
          th, td { border: 1px solid #ccc; padding: 6px 10px; text-align: left; }
          th { background: #f0f0f0; }
          tr { break-inside: avoid; }
thead { display: table-header-group; }
        </style>
      </head>
      <body>
        <h1>Book Report</h1>
        <p>Generated on ${today}</p>

        <p><strong>Total books:</strong> ${data.totalBooks}</p>
        <p><strong>Average price:</strong> £${data.averagePrice.toFixed(2)}</p>

        <h2>Top 5 Most Expensive Books</h2>
        <table>
          <thead>
            <tr><th>Title</th><th>Price</th></tr>
          </thead>
          <tbody>
            ${topExpensiveRows}
          </tbody>
        </table>

        <h2>All Books</h2>
        <table>
          <thead>
            <tr><th>Title</th><th>Price</th><th>Rating</th></tr>
          </thead>
          <tbody>
            ${allBooksRows}
          </tbody>
        </table>
      </body>
    </html>
  `;
}

module.exports = { buildReportHtml };
