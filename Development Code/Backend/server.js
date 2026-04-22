// server.js
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();

// CORS Configuration
const allowedOrigins = [
  'http://localhost:5173',
  process.env.FRONTEND_URL, // Production Frontend URL
].filter(Boolean);

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
};

// Create HTTP Server & attach Socket.io
const server = http.createServer(app);
const io = new Server(server, {
  cors: corsOptions
});

io.on('connection', (socket) => {
  console.log(`Websocket client connected: ${socket.id}`);
  socket.on('disconnect', () => {
    console.log(`Websocket client disconnected: ${socket.id}`);
  });
});

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Health Check Endpoint (For Render/Railway/Heroku monitoring)
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Inject io into every request
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Routes
const maintenanceMiddleware = require('./middleware/maintenanceMiddleware');
app.use(maintenanceMiddleware);

const routes = require('./Routes/index');
app.use('/api/v1', routes);

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log(`[DATABASE] MongoDB Connected to: ${mongoose.connection.name}`);
    console.log(`[DATABASE] MONGO_URI from env: ${process.env.MONGO_URI ? 'LOADED' : 'MISSING'}`);
  })
  .catch(err => console.error('MongoDB error:', err));

// Default route
app.get('/', (req, res) => {
  res.send('Backend & Socket Server is running...');
});

// Start server using the HTTP instance
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});