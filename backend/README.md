# Hackathon Backend

A simple backend server built with Express.js to support the hackathon frontend.

## Setup

1. Install dependencies:
```
cd /Users/gutianhao/Desktop/hackathon/backend
npm install
```

2. Start the server:
```
npm start
```

Or for development with auto-restart:
```
npm run dev
```

## Available API Endpoints

- `GET /api/items` - Get all items
- `GET /api/items/:id` - Get a specific item by ID
- `POST /api/items` - Create a new item
- `PUT /api/items/:id` - Update an existing item
- `DELETE /api/items/:id` - Delete an item

## Data Storage

Data is stored in a simple JSON file at `data/db.json`. This approach is used for simplicity and rapid development.

For a production application, consider using a proper database system.
