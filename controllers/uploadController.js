const itemModel = require("../models/itemModels");
const extractTextFromPDF = require("../services/pdfService");

exports.uploadPDF = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const text = await extractTextFromPDF(req.file.path);
    console.log("Extracted Text:", text);

    const lines = text.split("\n");
    const items = [];

    lines.forEach(async (line) => {
      const match = line.match(/Name:\s*(.+),\s*Price:\s*(\d+),\s*Quantity:\s*(\d+)/);
      if (match) {
        const [, name, price, quantity] = match;

        const item = await itemModel.findOneAndUpdate(
          { name: name.trim() },
          { $set: { price: parseFloat(price), quantity: parseInt(quantity) } },
          { upsert: true, new: true }
        );

        items.push(item);
      }
    });

    res.json({ message: "PDF Processed Successfully", items });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error processing PDF" });
  }
};
