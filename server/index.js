const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 5000;
app.use(cors());
app.use(express.json());


app.get("/", (req, res) => {
  res.send("Server is running...");
});

// GET all providers
app.get("/api/providers", (req, res) => {
    const dataPath = path.join(__dirname, "data/providers.json");
    const raw = fs.readFileSync(dataPath);
    const providers = JSON.parse(raw);
    res.json(providers);
  });
  // GET by category
  app.get("/api/providers/:category", (req, res) => {
    const category = req.params.category.toLowerCase();
    const dataPath = path.join(__dirname, "data/providers.json");
    const raw = fs.readFileSync(dataPath);
    const providers = JSON.parse(raw);
    const filtered = providers.filter(p => p.category.toLowerCase() === category);
    res.json(filtered);
  });

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
