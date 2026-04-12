const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const dataDir = path.join(__dirname, 'data');
function readData(file) {
  const p = path.join(dataDir, file);
  if (!fs.existsSync(p)) return [];
  try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch (e) { return []; }
}
function writeData(file, data) {
  const p = path.join(dataDir, file);
  fs.writeFileSync(p, JSON.stringify(data, null, 2), 'utf8');
}

function setupCrud(route, file) {
  app.get(`/api/${route}`, (req, res) => {
    res.json(readData(file));
  });

  app.get(`/api/${route}/:id`, (req, res) => {
    const items = readData(file);
    const item = items.find((i) => String(i.id) === String(req.params.id));
    if (!item) return res.status(404).json({ error: 'Not found' });
    res.json(item);
  });

  app.post(`/api/${route}`, (req, res) => {
    const items = readData(file);
    const id = items.length ? Math.max(...items.map((i) => i.id || 0)) + 1 : 1;
    const newItem = Object.assign({ id }, req.body);
    items.push(newItem);
    writeData(file, items);
    res.status(201).json(newItem);
  });

  app.put(`/api/${route}/:id`, (req, res) => {
    const items = readData(file);
    const idx = items.findIndex((i) => String(i.id) === String(req.params.id));
    if (idx === -1) return res.status(404).json({ error: 'Not found' });
    items[idx] = Object.assign({}, items[idx], req.body);
    writeData(file, items);
    res.json(items[idx]);
  });

  app.delete(`/api/${route}/:id`, (req, res) => {
    let items = readData(file);
    const idx = items.findIndex((i) => String(i.id) === String(req.params.id));
    if (idx === -1) return res.status(404).json({ error: 'Not found' });
    const removed = items.splice(idx, 1)[0];
    writeData(file, items);
    res.json(removed);
  });
}

// Expose CRUD for customers, products, purchases
setupCrud('customers', 'customers.json');
setupCrud('products', 'products.json');
setupCrud('purchases', 'purchases.json');

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`JSON API server running on port ${port}`));
