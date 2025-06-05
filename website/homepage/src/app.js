const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();

app.set('views', path.join(__dirname, 'pages'));
app.set("view engine", "ejs");

const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, "static")));

const cardsData = JSON.parse(
  fs.readFileSync(path.join(__dirname, "data", "cards.json"), "utf8")
);

app.get("/", (req, res) => {
  res.render("index", { cards: cardsData.cards });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});