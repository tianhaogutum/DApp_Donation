const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.url}`);
  next();
});

// Initialize data directory if it doesn't exist
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir);
}

// Initialize database file if it doesn't exist
const dbPath = path.join(dataDir, 'db.json');
let db = { items: [] };

try {
  if (fs.existsSync(dbPath)) {
    db = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
  } else {
    fs.writeFileSync(dbPath, JSON.stringify({ items: [] }), 'utf-8');
  }
} catch (error) {
  console.error('Database initialization error:', error);
}

// Helper function to save db
const saveDatabase = () => {
  try {
    fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf-8');
    return true;
  } catch (error) {
    console.error('Database save error:', error);
    return false;
  }
};

// Request validation middleware
const validateItem = (req, res, next) => {
  const { name, description } = req.body;
  
  if (!name || typeof name !== 'string') {
    return res.status(400).json({ error: 'Valid name is required' });
  }
  
  if (description && typeof description !== 'string') {
    return res.status(400).json({ error: 'Description must be a string' });
  }
  
  next();
};

// Routes
app.get('/api/items', (req, res) => {
  try {
    res.json(db.items);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch items' });
  }
});

app.get('/api/items/:id', (req, res) => {
  try {
    const item = db.items.find(item => item.id === req.params.id);
    
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }
    
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch item' });
  }
});

app.post('/api/items', validateItem, (req, res) => {
  try {
    const newItem = {
      id: uuidv4(), // Use UUID instead of timestamp
      ...req.body,
      createdAt: new Date().toISOString()
    };
    
    db.items.push(newItem);
    
    if (saveDatabase()) {
      res.status(201).json(newItem);
    } else {
      res.status(500).json({ error: 'Failed to save item' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to create item' });
  }
});

app.put('/api/items/:id', validateItem, (req, res) => {
  try {
    const index = db.items.findIndex(item => item.id === req.params.id);
    
    if (index === -1) {
      return res.status(404).json({ error: 'Item not found' });
    }
    
    db.items[index] = {
      ...db.items[index],
      ...req.body,
      updatedAt: new Date().toISOString()
    };
    
    if (saveDatabase()) {
      res.json(db.items[index]);
    } else {
      res.status(500).json({ error: 'Failed to save item' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to update item' });
  }
});

app.delete('/api/items/:id', (req, res) => {
  try {
    const index = db.items.findIndex(item => item.id === req.params.id);
    
    if (index === -1) {
      return res.status(404).json({ error: 'Item not found' });
    }
    
    db.items.splice(index, 1);
    
    if (saveDatabase()) {
      res.status(204).send();
    } else {
      res.status(500).json({ error: 'Failed to save item' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete item' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong on the server!' });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});